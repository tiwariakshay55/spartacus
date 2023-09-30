import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { OrderDetailsService } from '../../order-details.service';
import {
  LaunchDialogService,
  LAUNCH_CALLER,
  OutletContextData,
} from '@spartacus/storefront';
import { of, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Consignment } from '@spartacus/order/root';

@Component({
  selector: 'cx-consignment-tracking-link',
  templateUrl: './consignment-tracking-link.component.html',
  host: { class: 'cx-list-header col-12' },
})
export class ConsignmentTrackingLinkComponent implements OnInit, OnDestroy {
  consignment: Consignment;
  protected subscription = new Subscription();
  protected orderDetailsService = inject(OrderDetailsService);
  protected launchDialogService = inject(LaunchDialogService);
  protected vcr = inject(ViewContainerRef);
  protected cd = inject(ChangeDetectorRef);
  protected outlet = inject(OutletContextData);

  @ViewChild('element') element: ElementRef;
  consignmentStatus: string[] = this.orderDetailsService.consignmentStatus;
  ngOnInit(): void {
    this.subscription.add(
      this.outlet?.context$.subscribe((context: { item?: Consignment }) => {
        if (context.item !== undefined) {
          this.consignment = context.item;
        }
        this.cd.markForCheck();
      })
    );
  }
  openTrackingDialog() {
    const modalInstanceData = {
      tracking$: of(this.consignment.consignmentTracking),
      shipDate: this.consignment.statusDate,
    };

    const dialog = this.launchDialogService.openDialog(
      LAUNCH_CALLER.CONSIGNMENT_TRACKING,
      this.element,
      this.vcr,
      modalInstanceData
    );

    if (dialog) {
      dialog.pipe(take(1)).subscribe();
    }
  }
  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
