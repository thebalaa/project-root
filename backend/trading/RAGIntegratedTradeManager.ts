import { SolanaTradeManager, TradeParams } from './TradeManager.js';
import { TradeRAGProvider } from './TradeRAGProvider.js';

export class RAGIntegratedTradeManager extends SolanaTradeManager {
  private ragProvider: TradeRAGProvider;

  constructor(connection: any /* or Connection */) {
    super(connection);
    this.ragProvider = new TradeRAGProvider();
  }

  /**
   * Overriding executeTrade to incorporate specialized AI-based RAG.
   */
  async executeTrade(params: TradeParams): Promise<string> {
    // 1) Retrieve specialized context from internal tables
    const userQuery = `User wants to trade from ${params.inputToken} to ${params.outputToken}. 
      Slippage: ${params.slippage}, amount: ${params.amount}`;
    const tradeInsights = await this.ragProvider.retrieveTradeInsights(userQuery);
    console.log('TradeRAG insights:', tradeInsights);

    // 2) Optionally do a further risk check or refine logic
    // e.g. if the insights indicate suspicious activity, bail out or adjust

    // 3) Call the normal SolanaTradeManager logic
    return super.executeTrade(params);
  }
} 