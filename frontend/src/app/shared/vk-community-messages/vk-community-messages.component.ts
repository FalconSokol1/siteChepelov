import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  DestroyRef,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { COMPANY } from '../../core/data/company';

declare global {
  interface Window {
    VK?: {
      Widgets: {
        CommunityMessages: (
          elementId: string,
          groupId: number,
          options?: Record<string, unknown>
        ) => { destroy?: (elementId: string) => void };
      };
    };
  }
}

const OPENAPI_SRC = 'https://vk.ru/js/api/openapi.js?169';

function loadVkOpenApi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.VK?.Widgets?.CommunityMessages) return Promise.resolve();

  const existing = document.querySelector<HTMLScriptElement>(`script[src="${OPENAPI_SRC}"]`);
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('VK OpenAPI load failed')), {
        once: true,
      });
      if (window.VK?.Widgets?.CommunityMessages) resolve();
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = OPENAPI_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('VK OpenAPI load failed'));
    document.head.appendChild(script);
  });
}

@Component({
  selector: 'app-vk-community-messages',
  standalone: true,
  template: `<div id="vk_community_messages" class="vk-community-messages" aria-hidden="true"></div>`,
  styles: [
    `
      :host {
        display: contents;
      }
      .vk-community-messages {
        /* контейнер для кнопки VK; позиционирует сама библиотека */
      }
    `,
  ],
})
export class VkCommunityMessagesComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private mounted = false;
  private widget: { destroy?: (elementId: string) => void } | null = null;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const sync = () => {
      const onManage = this.router.url.startsWith('/manage');
      if (onManage) this.teardown();
      else void this.mount();
    };

    sync();
    const sub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => sync());
    this.destroyRef.onDestroy(() => {
      sub.unsubscribe();
      this.teardown();
    });
  }

  private async mount(): Promise<void> {
    if (this.mounted) return;
    try {
      await loadVkOpenApi();
      if (!window.VK?.Widgets?.CommunityMessages) return;
      this.widget = window.VK.Widgets.CommunityMessages(
        'vk_community_messages',
        COMPANY.vkGroupId,
        {
          expanded: 0,
          widgetPosition: 'right',
          buttonType: 'blue_circle',
          disableButtonTooltip: 0,
          tooltipButtonText: 'Написать в VK',
          disableNewMessagesSound: 0,
          disableExpandChatSound: 1,
          welcomeScreen: 1,
        }
      );
      this.mounted = true;
    } catch {
      // виджет необязателен — сайт работает и без него
    }
  }

  private teardown(): void {
    if (!this.mounted) return;
    try {
      this.widget?.destroy?.('vk_community_messages');
    } catch {
      /* ignore */
    }
    const el = document.getElementById('vk_community_messages');
    if (el) el.innerHTML = '';
    this.widget = null;
    this.mounted = false;
  }
}
