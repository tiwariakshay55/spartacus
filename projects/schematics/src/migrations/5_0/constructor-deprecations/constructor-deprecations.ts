import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { ConstructorDeprecation } from '../../../shared/utils/file-utils';
import { migrateConstructorDeprecation } from '../../mechanism/constructor-deprecations/constructor-deprecations';
import { GENERATED_CONSTRUCTOR_MIGRATIONS } from './data/generated-constructor.migration';
import { CDS_MERCHANDISING_PRODUCT_SERVICE_CONSTRUCTOR_MIGRATION } from './data/cds-merchandising-product.service.migration';
import { CDS_MERCHANDISING_USER_CONTEXT_SERVICE_CONSTRUCTOR_MIGRATION } from './data/cds-merchandising-user-context.service.migration';
import { CONSIGNMENT_TRACKING_COMPONENT_CONSTRUCTOR_MIGRATION } from './data/consignment-tracking.component.migration';
import { TRACKING_EVENTS_COMPONENT_CONSTRUCTOR_MIGRATION } from './data/tracking-events.component.migration';

export const CONSTRUCTOR_DEPRECATIONS_DATA: ConstructorDeprecation[] = [
  ...GENERATED_CONSTRUCTOR_MIGRATIONS,
  CDS_MERCHANDISING_PRODUCT_SERVICE_CONSTRUCTOR_MIGRATION,
  CDS_MERCHANDISING_USER_CONTEXT_SERVICE_CONSTRUCTOR_MIGRATION,
  CONSIGNMENT_TRACKING_COMPONENT_CONSTRUCTOR_MIGRATION,
  TRACKING_EVENTS_COMPONENT_CONSTRUCTOR_MIGRATION,
];

export function migrate(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    return migrateConstructorDeprecation(
      tree,
      context,
      CONSTRUCTOR_DEPRECATIONS_DATA
    );
  };
}
