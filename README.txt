Mokya’s AI Algo Trader V4.2

Major addition: transaction-based paper trading accounting.

Dashboard now separates:
- Starting Capital
- Cash Balance
- Open Position Value
- Total Portfolio Value
- Realized P&L
- Unrealized P&L
- Total P&L
- P&L %
- BUY trade count
- SELL trade count
- Open positions
- Closed trades
- Automatic Paper Trade Ledger

Every simulated automatic BUY/SELL is recorded with:
- Date/time
- Stock
- Side
- Quantity
- Entry
- Exit
- P&L
- Strategy version

Portfolio value is calculated from:
Cash + current market value of open positions.

P&L is calculated from the transaction-based paper portfolio, not random portfolio movement.

V4.2 remains simulated until Angel One live data integration.
