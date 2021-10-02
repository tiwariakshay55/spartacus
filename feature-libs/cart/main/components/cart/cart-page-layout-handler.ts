import { Injectable } from '@angular/core';
import { SelectiveCartService } from '@spartacus/cart/main/core';
import { ActiveCartFacade, Cart } from '@spartacus/cart/main/root';
import { PageLayoutHandler } from '@spartacus/storefront';
import { combineLatest, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CartPageLayoutHandler implements PageLayoutHandler {
  constructor(
    protected activeCartService: ActiveCartFacade,
    protected selectiveCartService: SelectiveCartService
  ) {}

  handle(
    slots$: Observable<string[]>,
    pageTemplate?: string,
    section?: string
  ) {
    if (pageTemplate === 'CartPageTemplate' && !section) {
      return combineLatest([
        slots$,
        this.activeCartService.getActive(),
        this.selectiveCartService.isEnabled()
          ? this.selectiveCartService.getCart()
          : of({} as Cart),
        this.activeCartService.getLoading(),
      ]).pipe(
        map(([slots, cart, selectiveCart, loadingCart]) => {
          const exclude = (arr, args) =>
            arr.filter((item) => args.every((arg) => arg !== item));
          return Object.keys(cart).length === 0 && loadingCart
            ? exclude(slots, [
                'TopContent',
                'CenterRightContentSlot',
                'EmptyCartMiddleContent',
              ])
            : cart.totalItems
            ? exclude(slots, ['EmptyCartMiddleContent'])
            : selectiveCart.totalItems
            ? exclude(slots, [
                'EmptyCartMiddleContent',
                'CenterRightContentSlot',
              ])
            : exclude(slots, ['TopContent', 'CenterRightContentSlot']);
        })
      );
    }
    return slots$;
  }
}
