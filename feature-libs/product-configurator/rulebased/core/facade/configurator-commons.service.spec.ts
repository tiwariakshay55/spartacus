import { Type } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import * as ngrxStore from '@ngrx/store';
import { Store, StoreModule } from '@ngrx/store';
import { ActiveCartFacade, Cart } from '@spartacus/cart/base/root';
import { StateUtils } from '@spartacus/core';
import {
  CommonConfigurator,
  CommonConfiguratorUtilsService,
  ConfiguratorModelUtils,
} from '@spartacus/product-configurator/common';
import { cold } from 'jasmine-marbles';
import { Observable, of } from 'rxjs';
import { productConfigurationWithConflicts } from '../../testing/configurator-test-data';
import { ConfiguratorTestUtils } from '../../testing/configurator-test-utils';
import { Configurator } from '../model/configurator.model';
import { ConfiguratorActions } from '../state/actions/index';
import {
  CONFIGURATOR_FEATURE,
  ConfiguratorState,
  StateWithConfigurator,
} from '../state/configurator-state';
import { getConfiguratorReducers } from '../state/reducers/index';
import { ConfiguratorCartService } from './configurator-cart.service';
import { ConfiguratorCommonsService } from './configurator-commons.service';
import { ConfiguratorUtilsService } from './utils';

const PRODUCT_CODE = 'CONF_LAPTOP';
let OWNER_PRODUCT = ConfiguratorModelUtils.createInitialOwner();
let OWNER_CART_ENTRY = ConfiguratorModelUtils.createInitialOwner();
let OWNER_ORDER_ENTRY = ConfiguratorModelUtils.createInitialOwner();

const CONFIG_ID = '1234-56-7890';
const CONFIG_ID_TEMPLATE = '1234-56-78aa';
const GROUP_ID_1 = '123ab';
const GROUP_ID_2 = '1234-56-7892';

const GROUP_NAME = 'Software';
const GROUP_NAME_2 = 'Hardware';

const ATTRIBUTE_NAME_1 = 'Attribute_1';
const ATTRIBUTE_NAME_2 = 'Attribute_DropDown';

const ORDER_ID = '0000011';
const ORDER_ENTRY_NUMBER = 2;

const group1: Configurator.Group = {
  ...ConfiguratorTestUtils.createGroup(GROUP_ID_1),
  name: GROUP_NAME,
  groupType: Configurator.GroupType.ATTRIBUTE_GROUP,
  attributes: [
    {
      name: ATTRIBUTE_NAME_1,
      uiType: Configurator.UiType.STRING,
      userInput: 'input',
    },
    {
      name: ATTRIBUTE_NAME_2,
      uiType: Configurator.UiType.DROPDOWN,
      userInput: undefined,
    },
  ],
};

const group2: Configurator.Group = {
  ...ConfiguratorTestUtils.createGroup(GROUP_ID_2),
  name: GROUP_NAME_2,
  groupType: Configurator.GroupType.ATTRIBUTE_GROUP,
};

let productConfiguration: Configurator.Configuration = {
  ...ConfiguratorTestUtils.createConfiguration(CONFIG_ID),
};

const productConfigurationChanged: Configurator.Configuration = {
  ...ConfiguratorTestUtils.createConfiguration(CONFIG_ID),
};

const configurationState: ConfiguratorState = {
  configurations: { entities: {} },
};

const configurationStateWoLoading: ConfiguratorState = {
  configurations: { entities: {} },
};

let configCartObservable: Observable<Configurator.Configuration>;
let configOrderObservable: Observable<Configurator.Configuration>;
let configQuoteObservable: Observable<Configurator.Configuration>;
let isStableObservable: Observable<boolean>;
let cartObs: Observable<Cart>;

class MockActiveCartService {
  isStable(): Observable<boolean> {
    return isStableObservable;
  }
  getActive(): Observable<Cart> {
    return cartObs;
  }
}

class MockconfiguratorUtilsService {
  createConfigurationExtract(): Configurator.Configuration {
    return productConfiguration;
  }
  isConfigurationCreated(configuration: Configurator.Configuration): boolean {
    const configId: String = configuration.configId;
    return configId !== undefined && configId.length !== 0;
  }
  getConfigurationFromState(
    configurationLoaderState: StateUtils.ProcessesLoaderState<Configurator.Configuration>
  ): Configurator.Configuration | undefined {
    return configurationLoaderState.value;
  }
}

class MockConfiguratorCartService {
  readConfigurationForCartEntry() {
    return configCartObservable;
  }
  readConfigurationForOrderEntry() {
    return configOrderObservable;
  }
  readConfigurationForQuoteEntry() {
    return configQuoteObservable;
  }
}

function callGetOrCreate(
  serviceUnderTest: ConfiguratorCommonsService,
  owner: CommonConfigurator.Owner
) {
  const productConfigurationLoaderState: StateUtils.LoaderState<Configurator.Configuration> =
    {
      value: productConfiguration,
    };
  const productConfigurationLoaderStateChanged: StateUtils.LoaderState<Configurator.Configuration> =
    {
      value: productConfigurationChanged,
    };
  const obs = cold('x-y', {
    x: productConfigurationLoaderState,
    y: productConfigurationLoaderStateChanged,
  });
  spyOnProperty(ngrxStore, 'select').and.returnValue(() => () => obs);
  const configurationObs = serviceUnderTest.getOrCreateConfiguration(owner);
  return configurationObs;
}

describe('ConfiguratorCommonsService', () => {
  let serviceUnderTest: ConfiguratorCommonsService;
  let configuratorUtils: CommonConfiguratorUtilsService;
  let configuratorUtilsService: ConfiguratorUtilsService;
  let store: Store<StateWithConfigurator>;
  let configuratorCartService: ConfiguratorCartService;
  let configurationWithOverview: Configurator.Configuration;
  configOrderObservable = of(productConfiguration);
  configQuoteObservable = of(productConfiguration);
  configCartObservable = of(productConfiguration);
  isStableObservable = of(true);
  const cart: Cart = {};
  cartObs = of(cart);

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          StoreModule.forRoot({}),
          StoreModule.forFeature(CONFIGURATOR_FEATURE, getConfiguratorReducers),
        ],
        providers: [
          ConfiguratorCommonsService,
          {
            provide: ConfiguratorCartService,
            useClass: MockConfiguratorCartService,
          },
          {
            provide: ActiveCartFacade,
            useClass: MockActiveCartService,
          },
          {
            provide: ConfiguratorUtilsService,
            useClass: MockconfiguratorUtilsService,
          },
        ],
      });
    })
  );
  beforeEach(() => {
    configOrderObservable = of(productConfiguration);
    configCartObservable = of(productConfiguration);
    isStableObservable = of(true);

    serviceUnderTest = TestBed.inject(
      ConfiguratorCommonsService as Type<ConfiguratorCommonsService>
    );
    configuratorUtils = TestBed.inject(
      CommonConfiguratorUtilsService as Type<CommonConfiguratorUtilsService>
    );
    configuratorUtilsService = TestBed.inject(
      ConfiguratorUtilsService as Type<ConfiguratorUtilsService>
    );

    OWNER_PRODUCT = ConfiguratorModelUtils.createOwner(
      CommonConfigurator.OwnerType.PRODUCT,
      PRODUCT_CODE
    );

    OWNER_CART_ENTRY = ConfiguratorModelUtils.createOwner(
      CommonConfigurator.OwnerType.CART_ENTRY,
      '3'
    );

    OWNER_ORDER_ENTRY = ConfiguratorModelUtils.createOwner(
      CommonConfigurator.OwnerType.ORDER_ENTRY,
      configuratorUtils.getComposedOwnerId(ORDER_ID, ORDER_ENTRY_NUMBER)
    );

    productConfiguration = {
      ...ConfiguratorTestUtils.createConfiguration(CONFIG_ID, OWNER_PRODUCT),
      productCode: PRODUCT_CODE,
      groups: [group1, group2],
    };

    configuratorUtils.setOwnerKey(OWNER_PRODUCT);
    configuratorUtils.setOwnerKey(OWNER_CART_ENTRY);

    configurationState.configurations.entities[OWNER_PRODUCT.key] = {
      ...productConfiguration,
      loading: false,
    };

    configurationStateWoLoading.configurations.entities[OWNER_PRODUCT.key] = {
      ...productConfiguration,
      loading: undefined,
    };
    store = TestBed.inject(Store as Type<Store<StateWithConfigurator>>);
    configuratorCartService = TestBed.inject(
      ConfiguratorCartService as Type<ConfiguratorCartService>
    );
    spyOn(
      configuratorUtilsService,
      'createConfigurationExtract'
    ).and.callThrough();
  });

  it('should create service', () => {
    expect(serviceUnderTest).toBeDefined();
  });

  it('should call matching action on removeConfiguration', () => {
    spyOn(store, 'dispatch').and.callThrough();
    serviceUnderTest.removeConfiguration(productConfiguration.owner);
    expect(store.dispatch).toHaveBeenCalledWith(
      new ConfiguratorActions.RemoveConfiguration({
        ownerKey: productConfiguration.owner.key,
      })
    );
  });

  it('should get pending changes from store', () => {
    spyOnProperty(ngrxStore, 'select').and.returnValue(() => () => of(true));

    let hasPendingChanges = false;
    serviceUnderTest
      .hasPendingChanges(OWNER_PRODUCT)
      .subscribe((pendingChanges) => {
        hasPendingChanges = pendingChanges;
      });
    expect(hasPendingChanges).toBe(true);
  });

  describe('isConfigurationLoading', () => {
    it('should get configuration loading state from store', () => {
      spyOnProperty(ngrxStore, 'select').and.returnValue(
        () => () =>
          of(configurationState.configurations.entities[OWNER_PRODUCT.key])
      );

      let isLoading = false;
      serviceUnderTest
        .isConfigurationLoading(OWNER_PRODUCT)
        .subscribe((loading) => {
          isLoading = loading;
        });
      expect(isLoading).toBe(false);
    });
    it('should get loading false in case loading attribute is not available in state', () => {
      spyOnProperty(ngrxStore, 'select').and.returnValue(
        () => () =>
          of(
            configurationStateWoLoading.configurations.entities[
              OWNER_PRODUCT.key
            ]
          )
      );

      let isLoading = false;
      serviceUnderTest
        .isConfigurationLoading(OWNER_PRODUCT)
        .subscribe((loading) => {
          isLoading = loading;
        });
      expect(isLoading).toBe(false);
    });
  });

  it('should update a configuration, accessing the store', () => {
    cart.code = 'X';
    cartObs = of(cart);
    spyOnProperty(ngrxStore, 'select').and.returnValue(
      () => () => of(productConfiguration)
    );
    const changedAttribute: Configurator.Attribute = {
      name: ATTRIBUTE_NAME_1,
      groupId: GROUP_ID_1,
    };

    const updateType: Configurator.UpdateType =
      Configurator.UpdateType.ATTRIBUTE;

    serviceUnderTest.updateConfiguration(
      OWNER_PRODUCT.key,
      changedAttribute,
      updateType
    );

    expect(
      configuratorUtilsService.createConfigurationExtract
    ).toHaveBeenCalled();
  });

  it('should do nothing on update in case cart updates are pending', () => {
    isStableObservable = of(false);
    cart.code = 'X';
    cartObs = of(cart);
    const changedAttribute: Configurator.Attribute = {
      name: ATTRIBUTE_NAME_1,
      groupId: GROUP_ID_1,
    };
    const updateType: Configurator.UpdateType =
      Configurator.UpdateType.ATTRIBUTE;

    serviceUnderTest.updateConfiguration(
      OWNER_PRODUCT.key,
      changedAttribute,
      updateType
    );

    expect(
      configuratorUtilsService.createConfigurationExtract
    ).toHaveBeenCalledTimes(0);
  });

  it('should update a configuration in case no session cart is present yet, even when cart is busy', () => {
    cart.code = undefined;
    cartObs = of(cart);
    isStableObservable = of(false);
    spyOnProperty(ngrxStore, 'select').and.returnValue(
      () => () => of(productConfiguration)
    );

    const changedAttribute: Configurator.Attribute = {
      name: ATTRIBUTE_NAME_1,
      groupId: GROUP_ID_1,
    };

    const updateType: Configurator.UpdateType =
      Configurator.UpdateType.ATTRIBUTE;

    serviceUnderTest.updateConfiguration(
      OWNER_PRODUCT.key,
      changedAttribute,
      updateType
    );

    expect(
      configuratorUtilsService.createConfigurationExtract
    ).toHaveBeenCalled();
  });

  it('should update a configuration in case if no updateType parameter in the call', () => {
    cart.code = 'X';
    cartObs = of(cart);
    spyOnProperty(ngrxStore, 'select').and.returnValue(
      () => () => of(productConfiguration)
    );
    const changedAttribute: Configurator.Attribute = {
      name: ATTRIBUTE_NAME_1,
      groupId: GROUP_ID_1,
    };

    const updateType: Configurator.UpdateType =
      Configurator.UpdateType.ATTRIBUTE;

    serviceUnderTest.updateConfiguration(OWNER_PRODUCT.key, changedAttribute);

    expect(
      configuratorUtilsService.createConfigurationExtract
    ).toHaveBeenCalledWith(changedAttribute, productConfiguration, updateType);
  });

  describe('getConfigurationWithOverview', () => {
    configurationWithOverview = {
      ...ConfiguratorTestUtils.createConfiguration(
        CONFIG_ID,
        ConfiguratorModelUtils.createInitialOwner()
      ),
      overview: { configId: CONFIG_ID, productCode: PRODUCT_CODE },
    };
    const productConfigurationLoaderState: StateUtils.LoaderState<Configurator.Configuration> =
      {
        loading: false,
        value: productConfiguration,
      };
    const productConfigurationLoaderStateLoading: StateUtils.LoaderState<Configurator.Configuration> =
      {
        loading: true,
        value: productConfiguration,
      };
    const productConfigurationLoaderStateWithOv: StateUtils.LoaderState<Configurator.Configuration> =
      {
        loading: false,
        value: configurationWithOverview,
      };

    it('should read OV by triggering respective action if that is not present', (done) => {
      expect(productConfiguration.overview).toBeUndefined();
      spyOnProperty(ngrxStore, 'select').and.returnValue(
        () => () =>
          of(
            productConfigurationLoaderState,
            productConfigurationLoaderStateLoading,
            productConfigurationLoaderStateWithOv
          )
      );

      spyOn(store, 'dispatch').and.callThrough();
      serviceUnderTest
        .getConfigurationWithOverview(productConfiguration)
        .subscribe(() => {
          expect(store.dispatch).toHaveBeenCalledWith(
            new ConfiguratorActions.GetConfigurationOverview(
              productConfiguration
            )
          );
          done();
        })
        .unsubscribe();
    });
    describe('through filterNotLoadingAndCreatedConfiguration', () => {
      it('should not emit as long as loader state is `loading`', () => {
        expect(
          serviceUnderTest['filterNotLoadingAndCreatedConfiguration'](
            cold('a-a-b', {
              a: productConfigurationLoaderStateLoading,
              b: productConfigurationLoaderState,
            })
          )
        ).toBeObservable(
          cold('----b', { b: productConfigurationLoaderState.value })
        );
      });
    });

    it('should not dispatch an action if overview is already present', (done) => {
      spyOnProperty(ngrxStore, 'select').and.returnValue(
        () => () => of(productConfigurationLoaderStateWithOv)
      );

      spyOn(store, 'dispatch').and.callThrough();
      serviceUnderTest
        .getConfigurationWithOverview(productConfiguration)
        .subscribe(() => {
          expect(store.dispatch).toHaveBeenCalledTimes(0);
          done();
        })
        .unsubscribe();
    });

    it('should return configuration with OV if that is already present in store', (done) => {
      spyOnProperty(ngrxStore, 'select').and.returnValue(
        () => () => of(productConfigurationLoaderStateWithOv)
      );
      spyOn(store, 'dispatch').and.callThrough();
      serviceUnderTest
        .getConfigurationWithOverview(productConfiguration)
        .subscribe((configuration) => {
          expect(configuration).toBe(configurationWithOverview);
          done();
        })
        .unsubscribe();
    });
  });

  describe('updateConfigurationOverview', () => {
    it('should fire the corresponding action', () => {
      spyOn(store, 'dispatch').and.callThrough();
      serviceUnderTest.updateConfigurationOverview(productConfiguration);
      expect(store.dispatch).toHaveBeenCalledWith(
        new ConfiguratorActions.UpdateConfigurationOverview(
          productConfiguration
        )
      );
    });
  });

  describe('getConfiguration', () => {
    it('should return an unchanged observable of product configurations in case configurations carry valid config IDs', () => {
      const obs = cold('x-y', {
        x: productConfiguration,
        y: productConfigurationChanged,
      });
      spyOnProperty(ngrxStore, 'select').and.returnValue(() => () => obs);
      const configurationObs = serviceUnderTest.getConfiguration(
        productConfiguration.owner
      );
      expect(configurationObs).toBeObservable(obs);
    });

    it('should filter incomplete configurations from store', () => {
      const productConfigIncomplete = {
        ...productConfigurationChanged,
        configId: '',
      };

      const obs = cold('xy|', {
        x: productConfiguration,
        y: productConfigIncomplete,
      });
      spyOnProperty(ngrxStore, 'select').and.returnValue(() => () => obs);

      const configurationObs = serviceUnderTest.getConfiguration(
        productConfiguration.owner
      );
      expect(configurationObs).toBeObservable(
        cold('x-|', {
          x: productConfiguration,
        })
      );
    });
  });

  describe('getOrCreateConfiguration', () => {
    it('should return an unchanged observable of product configurations in case configurations exist and carry valid config IDs', () => {
      const configurationObs = callGetOrCreate(serviceUnderTest, OWNER_PRODUCT);
      expect(configurationObs).toBeObservable(
        cold('x-y', {
          x: productConfiguration,
          y: productConfigurationChanged,
        })
      );
    });

    it('should delegate to config cart service for cart bound configurations', () => {
      spyOn(
        configuratorCartService,
        'readConfigurationForCartEntry'
      ).and.callThrough();

      serviceUnderTest.getOrCreateConfiguration(OWNER_CART_ENTRY);

      expect(
        configuratorCartService.readConfigurationForCartEntry
      ).toHaveBeenCalledWith(OWNER_CART_ENTRY);
    });

    it('should delegate to config cart service for order bound configurations', () => {
      spyOn(
        configuratorCartService,
        'readConfigurationForOrderEntry'
      ).and.callThrough();

      serviceUnderTest.getOrCreateConfiguration(OWNER_ORDER_ENTRY);

      expect(
        configuratorCartService.readConfigurationForOrderEntry
      ).toHaveBeenCalledWith(OWNER_ORDER_ENTRY);
    });

    it('should create a new configuration if not existing yet', () => {
      const productConfigurationLoaderState: StateUtils.LoaderState<Configurator.Configuration> =
        {
          loading: false,
        };

      const obs = cold('x', {
        x: productConfigurationLoaderState,
      });
      spyOnProperty(ngrxStore, 'select').and.returnValue(() => () => obs);
      spyOn(store, 'dispatch').and.callThrough();

      const configurationObs =
        serviceUnderTest.getOrCreateConfiguration(OWNER_PRODUCT);
      expect(configurationObs).toBeObservable(cold('', {}));
      expect(store.dispatch).toHaveBeenCalledWith(
        new ConfiguratorActions.CreateConfiguration({
          owner: OWNER_PRODUCT,
          configIdTemplate: undefined,
        })
      );
    });

    it('should hand over configuration ID template to action', () => {
      const productConfigurationLoaderState: StateUtils.LoaderState<Configurator.Configuration> =
        {
          loading: false,
        };

      const obs = cold('x', {
        x: productConfigurationLoaderState,
      });
      spyOnProperty(ngrxStore, 'select').and.returnValue(() => () => obs);
      spyOn(store, 'dispatch').and.callThrough();

      const configurationObs = serviceUnderTest.getOrCreateConfiguration(
        OWNER_PRODUCT,
        CONFIG_ID_TEMPLATE
      );
      expect(configurationObs).toBeObservable(cold('', {}));
      expect(store.dispatch).toHaveBeenCalledWith(
        new ConfiguratorActions.CreateConfiguration({
          owner: OWNER_PRODUCT,
          configIdTemplate: CONFIG_ID_TEMPLATE,
        })
      );
    });

    it('should not create a new configuration if not existing yet but status is loading', () => {
      const productConfigurationLoaderState: StateUtils.LoaderState<Configurator.Configuration> =
        {
          loading: true,
        };

      const obs = cold('x', {
        x: productConfigurationLoaderState,
      });
      spyOnProperty(ngrxStore, 'select').and.returnValue(() => () => obs);
      spyOn(store, 'dispatch').and.callThrough();

      const configurationObs =
        serviceUnderTest.getOrCreateConfiguration(OWNER_PRODUCT);
      expect(configurationObs).toBeObservable(cold('', {}));
      expect(store.dispatch).toHaveBeenCalledTimes(0);
    });

    it('should not create a new configuration if existing yet but erroneous', () => {
      const productConfigurationLoaderState: StateUtils.LoaderState<Configurator.Configuration> =
        {
          loading: false,
          error: true,
        };

      const obs = cold('x', {
        x: productConfigurationLoaderState,
      });
      spyOnProperty(ngrxStore, 'select').and.returnValue(() => () => obs);
      spyOn(store, 'dispatch').and.callThrough();

      const configurationObs =
        serviceUnderTest.getOrCreateConfiguration(OWNER_PRODUCT);
      expect(configurationObs).toBeObservable(cold('', {}));
      expect(store.dispatch).toHaveBeenCalledTimes(0);
    });
  });

  describe('hasConflicts', () => {
    it('should return false in case of no conflicts', (done) => {
      spyOnProperty(ngrxStore, 'select').and.returnValue(
        () => () => of(productConfiguration)
      );
      serviceUnderTest
        .hasConflicts(OWNER_PRODUCT)
        .pipe()
        .subscribe((hasConflicts) => {
          expect(hasConflicts).toBe(false);
          done();
        })
        .unsubscribe();
    });

    it('should return true in case of conflicts', (done) => {
      spyOnProperty(ngrxStore, 'select').and.returnValue(
        () => () => of(productConfigurationWithConflicts)
      );
      serviceUnderTest
        .hasConflicts(OWNER_PRODUCT)
        .pipe()
        .subscribe((hasConflicts) => {
          expect(hasConflicts).toBe(true);
          done();
        })
        .unsubscribe();
    });
  });

  describe('removeProductBoundConfigurations', () => {
    it('should call matching action on removeProductBoundConfigurations', () => {
      spyOn(store, 'dispatch').and.callThrough();
      serviceUnderTest.removeProductBoundConfigurations();
      expect(store.dispatch).toHaveBeenCalledWith(
        new ConfiguratorActions.RemoveProductBoundConfigurations()
      );
    });
  });

  describe('dismissConflictSolverDialog', () => {
    it('should call matching action', () => {
      spyOn(store, 'dispatch').and.callThrough();
      serviceUnderTest.dismissConflictSolverDialog(OWNER_PRODUCT);
      expect(store.dispatch).toHaveBeenCalledWith(
        new ConfiguratorActions.DissmissConflictDialoge(OWNER_PRODUCT.key)
      );
    });
  });

  describe('checkConflictSolverDialog', () => {
    it('should call matching action', () => {
      spyOn(store, 'dispatch').and.callThrough();
      serviceUnderTest.checkConflictSolverDialog(OWNER_PRODUCT);
      expect(store.dispatch).toHaveBeenCalledWith(
        new ConfiguratorActions.CheckConflictDialoge(OWNER_PRODUCT.key)
      );
    });
  });

  describe('forceNewConfiguration', () => {
    it('should call create action', () => {
      spyOn(store, 'dispatch').and.callThrough();
      serviceUnderTest.forceNewConfiguration(OWNER_PRODUCT);
      expect(store.dispatch).toHaveBeenCalledWith(
        new ConfiguratorActions.CreateConfiguration({
          owner: OWNER_PRODUCT,
          configIdTemplate: undefined,
          forceReset: true,
        })
      );
    });

    it('should remove configuration from state', () => {
      spyOn(store, 'dispatch').and.callThrough();
      serviceUnderTest.forceNewConfiguration(OWNER_PRODUCT);
      expect(store.dispatch).toHaveBeenCalledWith(
        new ConfiguratorActions.RemoveConfiguration({
          ownerKey: OWNER_PRODUCT.key,
        })
      );
    });
  });
});
