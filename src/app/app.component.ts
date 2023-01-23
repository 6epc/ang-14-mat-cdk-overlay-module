import { Component, OnDestroy, OnInit } from '@angular/core';

import { BreakpointObserver } from '@angular/cdk/layout';
import { Overlay, OverlayPositionBuilder } from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import { ComponentPortal } from '@angular/cdk/portal';

import { Subscription, Observable, map, distinctUntilChanged, tap } from 'rxjs';

import { DialogComponent } from './overlay-example/dialog/dialog.component';


import { bsBreakpoints } from './shared/breakpoints';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  overlaySub!: Subscription;

  //vars for 1t variant breakpoint start
  xsScreen$!: Observable<boolean>;
  smScreen$!: Observable<boolean>;
  mdScreen$!: Observable<boolean>;
  lgScreen$!: Observable<boolean>;
  xlScreen$!: Observable<boolean>;
  //vars for 1t variant breakpoint end

  constructor(
    public platform: Platform,
    private breakpointObserver: BreakpointObserver,
    private overlay: Overlay,
    private positionBuilder: OverlayPositionBuilder
  ) { }

  ngOnInit(): void {
    if (this.breakpointObserver.isMatched('(max-width: 600px)')) {
      console.log('The screen width is less then 600px');
    }

    //init 1t variant breakpoints
    this.xsScreen$ = this.breakpointObserver.observe([bsBreakpoints.xs,]).pipe(map(({ matches }) => matches));
    this.smScreen$ = this.breakpointObserver.observe([bsBreakpoints.sm,]).pipe(map(({ matches }) => matches));
    this.mdScreen$ = this.breakpointObserver.observe([bsBreakpoints.md,]).pipe(map(({ matches }) => matches));
    this.lgScreen$ = this.breakpointObserver.observe([bsBreakpoints.lg,]).pipe(map(({ matches }) => matches));
    this.xlScreen$ = this.breakpointObserver.observe([bsBreakpoints.xl,]).pipe(map(({ matches }) => matches));
  }
  createDialog() {
    const overlayRef = this.overlay.create({
      hasBackdrop: true,
      positionStrategy: this.positionBuilder.global().centerVertically().centerHorizontally()
    })
    const dialogPortal = new ComponentPortal(DialogComponent);
    overlayRef.attach(dialogPortal);
    this.overlaySub = overlayRef.backdropClick().subscribe(() => overlayRef.detach());
  }

  ngOnDestroy(): void {
    if (this.overlaySub) {
      this.overlaySub.unsubscribe();
    }
  }
}

