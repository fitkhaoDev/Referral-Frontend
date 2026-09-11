import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '@shared/shared.module';
import { RuleScopeOptionsService } from '../../shared/rule-scope-options.service';
import { organisationApiProvider } from '../organisations/data-access/organisation-api.provider';
import { organisationTypeApiProvider } from '../organisation-types/data-access/organisation-type-api.provider';
import { partnerTypeApiProvider } from '../partner-types/data-access/partner-type-api.provider';
import { DiscountRuleFormDialogComponent } from './components/discount-rule-form-dialog/discount-rule-form-dialog.component';
import { discountRuleApiProvider } from './data-access/discount-rule-api.provider';
import { DiscountRuleListComponent } from './pages/discount-rule-list/discount-rule-list.component';
import { DiscountRulesRoutingModule } from './discount-rules-routing.module';
import {
  DISCOUNT_RULES_CRUD_KEY,
  discountRulesCrudReducer,
} from './store/discount-rules.crud.reducer';
import { DiscountRulesEffects } from './store/discount-rules.effects';
import { DiscountRulesFacade } from './store/discount-rules.facade';
import { discountRulesList } from './store/discount-rules.list';

/** Admin → Discount Rules feature (lazy-loaded). */
@NgModule({
  imports: [
    SharedModule,
    DiscountRulesRoutingModule,
    StoreModule.forFeature(discountRulesList.name, discountRulesList.reducer),
    StoreModule.forFeature(DISCOUNT_RULES_CRUD_KEY, discountRulesCrudReducer),
    EffectsModule.forFeature([DiscountRulesEffects]),
  ],
  declarations: [DiscountRuleListComponent, DiscountRuleFormDialogComponent],
  providers: [
    discountRuleApiProvider,
    partnerTypeApiProvider,
    organisationTypeApiProvider,
    organisationApiProvider,
    RuleScopeOptionsService,
    DiscountRulesFacade,
  ],
})
export class DiscountRulesModule {}
