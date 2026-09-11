import { Observable } from 'rxjs';
import { Id, Page, PageQuery } from '@core/models/api.model';
import { WalletSummary, WalletTransaction } from '../models/wallet.model';

/**
 * Wallets contract (admin, permission `wallet:read`). Read-only — the admin never
 * edits a balance or a ledger row from here.
 *
 * ── Endpoints ─────────────────────────────────────────────────────────────────
 * listWallets   GET /api/admin/wallets
 *   query   page, size, sort=<field>,<dir>,
 *           search (ownerName, ownerRef),
 *           ownerType = PARTNER | ORGANISATION | DOCTOR
 *   res     200 Page<WalletSummary>
 *
 * getWallet     GET /api/admin/wallets/{id}
 *   res     200 WalletSummary | 404 WALLET_NOT_FOUND
 *
 * listTransactions  GET /api/admin/wallets/{id}/transactions
 *   query   page, size, sort=<field>,<dir>,
 *           type = COUNSELLING_INCENTIVE | FIRST_PURCHASE_INCENTIVE | RENEWAL_INCENTIVE
 *                | WITHDRAWAL | REVERSAL | RECOVERY | ADJUSTMENT,
 *           status = PENDING | AVAILABLE | PAID | RECOVERED | REVERSED,
 *           fromDate=YYYY-MM-DD, toDate=YYYY-MM-DD  (inclusive, on occurredAt)
 *   res     200 Page<WalletTransaction> | 404 WALLET_NOT_FOUND
 *
 * Every figure on {@link WalletSummary} and every `amount` on a
 * {@link WalletTransaction} is backend-computed. The client MUST NOT sum the ledger
 * to derive a balance — it renders the summary the backend returns. A reversal is a
 * separate DEBIT row; the original credit row is never mutated.
 */
export abstract class WalletApi {
  abstract listWallets(query: PageQuery): Observable<Page<WalletSummary>>;
  abstract getWallet(id: Id): Observable<WalletSummary>;
  abstract listTransactions(walletId: Id, query: PageQuery): Observable<Page<WalletTransaction>>;
}
