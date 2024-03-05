/*
 * SPDX-FileCopyrightText: 2024 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@angular/core';
import { Config } from '@spartacus/core';
import { ImageLoadingStrategy, MediaFormatSize } from './media.model';

/**
 * Provides configuration specific to Media, such as images. This is used to optimize
 * rendering of the media, SEO and performance.
 */
@Injectable({
  providedIn: 'root',
  useExisting: Config,
})
export abstract class MediaConfig {
  /**
   * Media _format_ configuration holds the size of the media's assigned to
   * a format.
   */
  mediaFormats?: {
    /**
     * Represents the media format code, that is the key to distinguish different
     * media in a container.
     */
    [format: string]: MediaFormatSize;
  };

  /**
   * Indicates how the browser should load the image. There's only one
   * global strategy for all media cross media in Spartacus.
   *
   * See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img for more
   * information.
   *
   * If the `lazy` strategy is in place, the `loading="lazy"` attribute is added to the
   * img element.
   */
  imageLoadingStrategy?: ImageLoadingStrategy;

  /**
   * As of v7.0, Spartacus started using the <picture> element by default when a srcset is available.
   *
   * See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture for more
   * information.
   *
   * If this breaks your project, you may set this option to true and use the legacy component instead.
   */
  useLegacyMediaComponent?: boolean;
}

declare module '@spartacus/core' {
  interface Config extends MediaConfig {}
}
