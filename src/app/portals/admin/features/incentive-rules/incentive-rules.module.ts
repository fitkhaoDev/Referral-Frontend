import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '@shared/shared.module';
import { RuleScopeOptionsService } from '../../shared/rule-scope-options.service';
import { organisationApiProvider } from '../organisations/data-access/organisation-api.provider';
import { organisationTypeApiProvider } from '../organisation-types/data-access/organisation-type-api.provider';
import { partnerTypeApiProvider } from '../partner-types/data-access/partner-type-api.provider';
import { IncentiveComponentFieldComponent } from './components/incentive-component-field/incentive-component-field.component';
import { IncentiveRuleFormDialogComponent } from './components/incentive-rule-form-dialog/incentive-rule-form-dialog.component';
import { RenewalIncentiveFieldComponent } from './components/renewal-incentive-field/renewal-incentive-field.component';
import { incentiveRuleApiProvider } from './data-access/incentive-rule-api.provider';
import { IncentiveRuleListComponent } from './pages/incentive-rule-list/incentive-rule-list.component';
import { IncentiveRulesRoutingModule } from './incentive-rules-routing.module';
import {
  INCENTIVE_RULES_CRUD_KEY,
  incentiveRulesCrudReducer,
} from './store/incentive-rules.crud.reducer';
import { IncentiveRulesEffects } from './store/incentive-rules.effects';
import { IncentiveRulesFacade } from './store/incentive-rules.facade';
import { incentiveRulesList } from './store/incentive-rules.list';

/** Admin → Incentive Rules feature (the dynamic incentive engine config). Lazy-loaded. */
@NgModule({
  imports: [
    SharedModule,
    IncentiveRulesRoutingModule,
    StoreModule.forFeature(incentiveRulesList.name, incentiveRulesList.reducer),
    StoreModule.forFeature(INCENTIVE_RULES_CRUD_KEY, incentiveRulesCrudReducer),
    EffectsModule.forFeature([IncentiveRulesEffects]),
  ],
  declarations: [
    IncentiveRuleListComponent,
    IncentiveRuleFormDialogComponent,
    IncentiveComponentFieldComponent,
    RenewalIncentiveFieldComponent,
  ],
  providers: [
    incentiveRuleApiProvider,
    partnerTypeApiProvider,
    organisationTypeApiProvider,
    organisationApiProvider,
    RuleScopeOptionsService,
    IncentiveRulesFacade,
  ],
})
export class IncentiveRulesModule {}
