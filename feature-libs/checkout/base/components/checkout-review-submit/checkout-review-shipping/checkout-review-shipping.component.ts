/*
 * SPDX-FileCopyrightText: 2023 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, OnInit } from '@angular/core';
import { ActiveCartFacade } from '@spartacus/cart/base/root';
import { Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'cx-checkout-review-shipping',
  templateUrl: './checkout-review-shipping.component.html',
})
export class CheckoutReviewShippingComponent implements OnInit {

  hasShippingItems$: Observable<boolean> = this.activeCartFacade.hasDeliveryItems().pipe(distinctUntilChanged());

  constructor(protected activeCartFacade: ActiveCartFacade) { }

  ngOnInit(): void {
  }

}
