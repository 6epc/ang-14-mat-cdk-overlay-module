import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { delay, EMPTY, filter, iif, map, merge, Observable, startWith, Subscription, switchMap } from 'rxjs';

import { FocusMonitor } from '@angular/cdk/a11y';
import { CdkConnectedOverlay, ConnectedPosition, ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { MatInput } from '@angular/material/input';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

export interface State {
  flag: string;
  name: string;
  population: string;
}

@Component({
  selector: 'app-drop-down-search',
  templateUrl: './drop-down-search.component.html',
  styleUrls: ['./drop-down-search.component.scss']
})
export class DropDownSearchComponent implements OnInit, OnDestroy {
  @ViewChild(MatInput, { read: ElementRef, static: true }) private inputEl!: ElementRef;
  @ViewChild(CdkConnectedOverlay, { static: true }) private connectedOverlay!: CdkConnectedOverlay;

  states: State[] = [
    {
      name: 'Vienna',
      population: '1.897M',
      flag:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Flag_of_Vienna_%28state%29.svg/300px-Flag_of_Vienna_%28state%29.svg.png?20200515155329',
    },
    {
      name: 'Salzburg',
      population: '152.367K',
      // https://commons.wikimedia.org/wiki/File:Flag_of_California.svg
      flag:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Flag_of_Salzburg_%28state%29.svg/1280px-Flag_of_Salzburg_%28state%29.svg.png',
    },
    {
      name: 'Kiev',
      population: '2.884M',
      flag:
        'https://upload.wikimedia.org/wikipedia/commons/3/35/Flag_of_Kyiv_Kurovskyi.svg',
    },
    {
      name: 'Novopskov',
      population: '9,891K',
      flag:
        '//upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Flag_of_Novopskovskiy_Raion_in_Luhansk_Oblast.png/100px-Flag_of_Novopskovskiy_Raion_in_Luhansk_Oblast.png',
    },
  ];
  stateCtrl = new FormControl();

  isCaseSensitive: boolean = false;
  positions: ConnectedPosition[] = [
    {
      originX: 'center',
      originY: 'bottom',
      overlayX: 'center',
      overlayY: 'top',
      offsetY: -20,
    },
    {
      originX: 'center',
      originY: 'top',
      overlayX: 'center',
      overlayY: 'bottom',

    },
  ];

  filteredStates$!: Observable<State[]>;
  showPanel$!: Observable<boolean>;
  showPanel!:boolean;
  showPanelSub!: Subscription;

  private isOverlayDetached$!: Observable<void>;
  private isPanelVisible$!: Observable<boolean>;
  private isPanelHidden$!: Observable<boolean>;

  scrollStrategy!: ScrollStrategy;

  constructor(
    private focusMonitor: FocusMonitor,
    private scrollStrategies: ScrollStrategyOptions
  ) { }

  ngOnInit(): void {
    // block the scroll, the overlay and backdrop are not scrolling anymore
    this.scrollStrategy = this.scrollStrategies.block();

    //default the overlay and backdrop are scrolling next to each other
    // this.scrollStrategy = this.scrollStrategies.reposition();

    //as soon as start scrolling - overlay and backdrop are detached
    // threshold - is a parameter, how many px you can scroll before detach
    // this.scrollStrategy = this.scrollStrategies.close({
    //   threshold: 100
    // })

    this.isPanelVisible$ = this.focusMonitor.monitor(this.inputEl).pipe(
      filter(focused => !!focused),
      map(() => true)
    );

    // this.isOverlayDetached$ = this.isPanelVisible$.pipe(
    //   delay(0),
    //   switchMap(() =>
    //     iif(
    //       () => !!this.connectedOverlay.overlayRef,
    //       this.connectedOverlay.overlayRef.detachments(),
    //       EMPTY
    //     )
    //   )
    // );
    // this.isPanelHidden$ = merge(this.isOverlayDetached$, this.connectedOverlay.backdropClick).pipe(
    //   map(() => false)
    // );

    this.isPanelHidden$ = merge(this.connectedOverlay.detach, this.connectedOverlay.backdropClick).pipe(map(() => false));

    this.showPanel$ = merge(this.isPanelHidden$, this.isPanelVisible$);
    this.showPanelSub = this.showPanel$.subscribe(v => this.showPanel = v);

    this.filteredStates$ = this.stateCtrl.valueChanges.pipe(
      startWith(''),
      map((state) => (state ? this._filterStates(state) : this.states.slice()))
    );
  }

  setCaseSensitive({ checked }: MatSlideToggleChange) {
    this.isCaseSensitive = checked;
  }

  private _filterStates(value: string): State[] {
    const filterValue = this.caseCheck(value);

    return this.states.filter(
      (state) => this.caseCheck(state.name).indexOf(filterValue) === 0
    );
  }

  private caseCheck(value: string) {
    return this.isCaseSensitive ? value : value.toLowerCase();
  }

  ngOnDestroy(): void {
    if (this.showPanelSub) {
      this.showPanelSub.unsubscribe();
    }
  }

}
