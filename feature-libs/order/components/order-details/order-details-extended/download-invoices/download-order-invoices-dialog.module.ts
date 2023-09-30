import { CommonModule } from '@angular/common';
import { inject, NgModule } from '@angular/core';
import { I18nModule, provideDefaultConfig } from '@spartacus/core';
import { PDFInvoicesComponentsModule } from '@spartacus/pdf-invoices/components';
import {
  IconModule,
  KeyboardFocusModule,
  PaginationModule,
  SortingModule,
} from '@spartacus/storefront';
import { defaultDownloadOrderInvoicesLayoutConfig } from './default-download-order-invoices-layout.config';
import { DownloadOrderInvoicesDialogComponent } from './download-order-invoices-dialog.component';
import { DownloadOrderInvoicesEventListener } from './download-order-invoices-event.listener';

@NgModule({
  imports: [
    CommonModule,
    KeyboardFocusModule,
    IconModule,
    I18nModule,
    PaginationModule,
    SortingModule,
    PDFInvoicesComponentsModule,
  ],
  providers: [provideDefaultConfig(defaultDownloadOrderInvoicesLayoutConfig)],
  exports: [DownloadOrderInvoicesDialogComponent],
  declarations: [DownloadOrderInvoicesDialogComponent],
})
export class DownloadOrderInvoicesDialogModule {
  protected downloadInvoicesDialogEventListener = inject(
    DownloadOrderInvoicesEventListener
  );
}
