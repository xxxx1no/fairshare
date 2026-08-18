import { test as base, expect, Page } from '@playwright/test';

type MyFixtures = {
  authenticatedPage: Page;
};

// Фикстура "авторизации" (приложение local-first, имитируем токен или начальное состояние)
const test = base.extend<MyFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Имитация входа/авторизации
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('user-auth', 'simulated-token');
    });
    await use(page);
  }
});

test.describe('E2E Тесты приложения FairShare', () => {

  test('Полный цикл: регистрация, создание, оплата, проверка ошибок и выход', async ({ authenticatedPage: page }) => {
    
    // 1. Проверка ошибок при создании события (Создание без названия)
    const titleInput = page.getByTestId('event-title-input');
    const createButton = page.getByTestId('create-event-button');
    
    await titleInput.fill(''); // Пустое поле
    await expect(createButton).toBeDisabled(); // Состояние ошибки: кнопка заблокирована

    // Успешный сценарий создания (Основное действие)
    await titleInput.pressSequentially('Поездка на море', { delay: 50 });
    await expect(createButton).toBeEnabled();
    await createButton.click();

    await page.waitForURL(/\/event\/.+/);
    await expect(page.getByText('Поездка на море')).toBeVisible();

    // 2. Регистрация участников и проверка ошибок
    const participantsTab = page.getByTestId('tab-participants');
    await participantsTab.click();
    
    const participantInput = page.getByTestId('participant-input');
    const addParticipantBtn = page.getByTestId('add-participant-button');
    
    // Попытка добавить с пустым полем (HTML5 валидация)
    await participantInput.fill('');
    await addParticipantBtn.click({ force: true });
    await expect(page.getByText('Нет участников')).toBeVisible(); // Никто не добавился

    // Успешная регистрация участников
    await participantInput.fill('Иван');
    await addParticipantBtn.click();
    await expect(page.getByText('Иван')).toBeVisible();

    await participantInput.fill('Анна');
    await addParticipantBtn.click();
    await expect(page.getByText('Анна')).toBeVisible();

    // 3. Оплата (Добавление расхода) и состояния с ошибками
    const expensesTab = page.getByTestId('tab-expenses');
    await expensesTab.click();
    
    const fabAddExpense = page.getByTestId('fab-add-expense');
    await fabAddExpense.click();

    const saveExpenseBtn = page.getByTestId('expense-save-button');
    
    // Попытка сохранить пустую форму (ошибка валидации required)
    await saveExpenseBtn.click({ force: true });
    // Все еще находимся на странице добавления
    await expect(page).toHaveURL(/.*\/add-expense/);

    // Успешная оплата (Добавление расхода)
    await page.getByTestId('expense-amount-input').fill('2000');
    await page.getByTestId('expense-title-input').fill('Обед');
    
    // Иван платит по умолчанию, участвуют оба
    await saveExpenseBtn.click();

    // Успешно перенаправлены обратно
    await page.waitForURL(/\/event\/.+/);
    await expect(page.getByText('Обед')).toBeVisible();
    await expect(page.getByText('2 000').first()).toBeVisible();

    // 4. Проверка итоговых долгов (Взаиморасчет)
    const balancesTab = page.getByTestId('tab-balances');
    await balancesTab.click();

    // Иван заплатил 2000 за двоих. Анна должна Ивану 1000.
    await expect(page.getByText('Анна')).toBeVisible();
    await expect(page.getByText('Иван')).toBeVisible();
    await expect(page.getByText('1000')).toBeVisible();
    
    // 5. Имитация выхода из аккаунта
    await page.evaluate(() => {
      localStorage.removeItem('user-auth');
    });
    await page.goto('/');
    await expect(titleInput).toBeVisible();
  });
});
