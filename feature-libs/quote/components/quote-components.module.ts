/*
 * SPDX-FileCopyrightText: 2023 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ListNavigationModule } from '@spartacus/storefront';
import { QuoteActionLinksModule } from './quote-action-links/quote-action-links.module';
import { QuoteActionsByRoleModule } from './quote-actions-by-role/quote-actions-by-role.module';
import { QuoteListModule } from './quote-list/quote-list.module';
import { QuoteRequestQuoteButtonModule } from './quote-request-quote-button/quote-request-quote-button.module';
import { QuoteRequestQuoteDialogModule } from './quote-request-quote-dialog/quote-request-quote-dialog.module';
import {
  QuoteDetailsCartModule,
  QuoteDetailsOverviewModule,
  QuoteDetailsVendorContactModule,
} from './details';

@NgModule({
  imports: [
    CommonModule,
    QuoteListModule,
    QuoteDetailsOverviewModule,
    QuoteDetailsCartModule,
    QuoteRequestQuoteButtonModule,
    QuoteRequestQuoteDialogModule,
    QuoteActionLinksModule,
    QuoteActionsByRoleModule,
    QuoteDetailsVendorContactModule,
    ListNavigationModule,
  ],
})
export class QuoteComponentsModule {}
