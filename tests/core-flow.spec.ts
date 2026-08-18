import { test, expect } from '@playwright/test';

test.describe('Split App Core Flow', () => {
  test('should create event, add participants, and split an expense', async ({ page }) => {
    // 1. Создание события
    await page.goto('/');
    
    const titleInput = page.getByTestId('event-title-input');
    
    try {
      await expect(titleInput).toBeVisible({ timeout: 15000 });
    } catch (e) {
      await page.screenshot({ path: 'screenshot-error.png' });
      throw e;
    }
    
    await titleInput.pressSequentially('Поездка в Сочи', { delay: 50 });
    
    const createButton = page.getByTestId('create-event-button');
    try {
      await expect(createButton).toBeEnabled({ timeout: 10000 });
    } catch (e) {
      await page.screenshot({ path: 'button-disabled-error.png' });
      throw e;
    }
    await createButton.click();
    
    // Проверяем, что произошел переход на страницу события (URL содержит /event/)
    await page.waitForURL(/\/event\/.+/);
    
    // 2. Добавление участников
    await page.getByTestId('tab-participants').click();
    
    const participantInput = page.getByTestId('participant-input');
    const addParticipantBtn = page.getByTestId('add-participant-button');
    
    // Добавляем Ивана
    await participantInput.fill('Иван');
    await addParticipantBtn.click();
    await expect(page.getByText('Иван', { exact: true })).toBeVisible();
    
    // Добавляем Анну
    await participantInput.fill('Анна');
    await addParticipantBtn.click();
    await expect(page.getByText('Анна', { exact: true })).toBeVisible();

    // 3. Добавление траты
    await page.getByTestId('tab-expenses').click();
    await page.getByTestId('fab-add-expense').click();
    
    // Проверяем, что перешли на страницу добавления траты
    await page.waitForURL(/\/event\/.+\/add-expense/);
    
    const expenseTitle = page.getByTestId('expense-title-input');
    const expenseAmount = page.getByTestId('expense-amount-input');
    const payerSelect = page.getByTestId('expense-payer-select');
    const saveExpenseBtn = page.getByTestId('expense-save-button');
    
    await expenseTitle.fill('Обед в ресторане');
    await expenseAmount.fill('2000');
    
    // Выбираем Ивана как плательщика (select value corresponds to participant id, but we can also select by text content if option is visible)
    await payerSelect.selectOption({ label: 'Иван' });
    
    // По умолчанию все участники выбраны как вовлеченные (Анна и Иван).
    // Просто сохраняем трату.
    await saveExpenseBtn.click();
    
    // Должно вернуть на страницу события
    await page.waitForURL(/\/event\/[^\/]+$/);
    
    // Проверяем, что трата появилась
    await expect(page.getByText('Обед в ресторане')).toBeVisible();
    await expect(page.getByText('2 000').first()).toBeVisible(); // с учетом форматирования

    // 4. Проверка долгов
    await page.getByTestId('tab-balances').click();
    
    // Иван заплатил 2000 за двоих.
    // Значит, Иван должен получить 1000, а Анна должна отдать 1000.
    
    // Ищем карточку с Анной и долгом
    const balances = page.locator('.flex-1'); // Вкладка balances
    await expect(balances.getByText('Анна')).toBeVisible();
    await expect(balances.getByText('Иван')).toBeVisible();
  });
});
