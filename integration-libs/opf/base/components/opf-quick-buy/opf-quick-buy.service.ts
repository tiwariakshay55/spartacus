/*
 * SPDX-FileCopyrightText: 2024 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable, inject } from '@angular/core';
import { CheckoutConfig } from '@spartacus/checkout/base/root';
import { AuthService, BaseSiteService, RoutingService } from '@spartacus/core';
import {
  OpfCartHandlerService,
  OpfPickupInStoreHandlerService,
} from '@spartacus/opf/base/core';
import {
  ActiveConfiguration,
  DigitalWalletQuickBuy,
  OpfPaymentFacade,
  OpfPaymentProviderType,
  OpfProviderType,
  OpfQuickBuyDeliveryType,
  OpfQuickBuyLocation,
} from '@spartacus/opf/base/root';
import { CurrentProductService } from '@spartacus/storefront';
import { Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class OpfQuickBuyService {
  protected opfPaymentFacade = inject(OpfPaymentFacade);
  protected checkoutConfig = inject(CheckoutConfig);
  protected baseSiteService = inject(BaseSiteService);
  protected authService = inject(AuthService);
  protected routingService = inject(RoutingService);
  protected opfCartHandlerService = inject(OpfCartHandlerService);
  protected currentProductService = inject(CurrentProductService);
  protected opfPickupInStoreHandlerService = inject(
    OpfPickupInStoreHandlerService
  );

  getPaymentGatewayConfiguration(): Observable<ActiveConfiguration> {
    return this.opfPaymentFacade
      .getActiveConfigurationsState()
      .pipe(
        map(
          (config) =>
            (config?.data || []).filter(
              (item) =>
                item?.providerType === OpfPaymentProviderType.PAYMENT_GATEWAY
            )[0]
        )
      );
  }

  getQuickBuyProviderConfig(
    provider: OpfProviderType,
    activeConfiguration: ActiveConfiguration
  ): DigitalWalletQuickBuy | undefined {
    let config;
    if (activeConfiguration && activeConfiguration.digitalWalletQuickBuy) {
      config = activeConfiguration?.digitalWalletQuickBuy.find(
        (item) => item.provider === provider
      );
    }

    return config;
  }

  isQuickBuyProviderEnabled(
    provider: OpfProviderType,
    activeConfiguration: ActiveConfiguration
  ): boolean {
    let isEnabled = false;
    if (activeConfiguration && activeConfiguration.digitalWalletQuickBuy) {
      isEnabled = Boolean(
        activeConfiguration?.digitalWalletQuickBuy.find(
          (item) => item.provider === provider
        )?.enabled
      );
    }

    return isEnabled;
  }

  isUserGuestOrLoggedIn(): Observable<boolean> {
    return this.baseSiteService.get().pipe(
      take(1),
      map((baseSite) => baseSite?.baseStore?.paymentProvider),
      switchMap((paymentProviderName) => {
        return paymentProviderName &&
          this.checkoutConfig.checkout?.flows?.[paymentProviderName]?.guest
          ? of(true)
          : this.authService.isUserLoggedIn();
      })
    );
  }

  getQuickBuyLocationContext(): Observable<OpfQuickBuyLocation> {
    return this.routingService.getRouterState().pipe(
      take(1),
      map(
        (routerState) =>
          routerState?.state?.semanticRoute?.toLocaleUpperCase() as OpfQuickBuyLocation
      )
    );
  }

  getQuickBuyDeliveryType(
    context: OpfQuickBuyLocation
  ): Observable<OpfQuickBuyDeliveryType> {
    if (context === OpfQuickBuyLocation.CART) {
      return this.opfCartHandlerService.hasActiveCartDeliveryItems().pipe(
        take(1),
        map((hasDeliveryItems) =>
          hasDeliveryItems
            ? OpfQuickBuyDeliveryType.SHIPPING
            : OpfQuickBuyDeliveryType.PICKUP
        )
      );
    } else {
      return this.opfPickupInStoreHandlerService
        .getSingleProductDeliveryType()
        .pipe(take(1));
    }
  }
}
