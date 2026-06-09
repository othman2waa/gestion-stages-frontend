import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  isCollapsed = false;

  ngOnInit(): void { this.applyResponsive(); }

  @HostListener('window:resize')
  onResize(): void { this.applyResponsive(); }

  /** Sur mobile, la sidebar est masquée par défaut (overlay ouvert via le bouton du navbar). */
  private applyResponsive(): void {
    if (window.innerWidth <= 768) {
      this.isCollapsed = true;
    }
  }
}