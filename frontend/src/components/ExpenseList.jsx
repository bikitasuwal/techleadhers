export default function ExpenseList({
  expenses,
  converting,
  homeCurrency,
  onDelete,
  total,
  anyConversionFailed,
  failedCount,
}) {
  if (expenses.length === 0) {
    return <p className="empty-state">No expenses yet add one above.</p>;
  }

  return (
    <div className="expense-list-wrapper">
      <ul className="expense-list">
        {expenses.map((expense) => (
          <li key={expense.id} className="expense-row">
            <div className="expense-main">
              <span className="expense-title">{expense.title}</span>
              <span className="expense-date">
                {new Date(expense.date).toLocaleDateString()}
              </span>
            </div>

            <div className="expense-amounts">
              <span className="expense-original">
                {expense.amount.toFixed(2)} {expense.currency}
              </span>

              {/* Show converted amount or error if conversion fail */}
              <span className="expense-converted">
                {converting && "Converting..."}
                {!converting && expense.conversionError && (
                  <span className="conversion-error" title={expense.conversionError}>
                    Conversion unavailable
                  </span>
                )}
                {!converting &&
                  !expense.conversionError &&
                  `~ ${expense.convertedAmount.toFixed(2)}`}
              </span>
            </div>

            <button
              className="delete-btn"
              onClick={() => onDelete(expense.id)}
              aria-label={`Delete ${expense.title}`}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {/* total of all converted expenes */}
      <div className="expense-total">
        <span>Total ({homeCurrency})</span>
        <span>
          {converting && "Calculating..."}
          {!converting && anyConversionFailed && (
            <>
              {total.toFixed(2)}
              <br />
              <span className="conversion-error">
                {failedCount} expense(s) could not be converted
              </span>
            </>
          )}
          {!converting && !anyConversionFailed && total.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
