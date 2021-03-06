import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';

@Component({
  selector: 'app-suite-info',
  templateUrl: './suite-info.component.html',
  styleUrls: ['./suite-info.component.scss']
})
export class SuiteInfoComponent implements OnInit, OnChanges {
  @Input()
  public suiteInfo: Object;
  @Input()
  public expandSuites: boolean;
  public suites: Array<any>;

  constructor() {}

  ngOnInit() {
    this.init();
  }

  public init() {
    this.suites = Object.keys(this.suiteInfo).filter(
      (e) => e !== '_' && e !== '$'
    );
  }

  public hasMoreSuites(suite) {
    // If _ is present then more than 1 keys is required otherwise just one key is fine
    const requiresKeysCount = (suite._ ? 1 : 0) + (suite.$ ? 1 : 0);

    if (Object.keys(suite).length > requiresKeysCount) {
      return true;
    } else {
      return false;
    }
  }

  public isPending(test) {
    if (typeof test !== 'object') {
      return true;
    } else {
      return false;
    }
  }

  public ngOnChanges(changes: SimpleChanges) {
    for (const key in changes) {
      if (key === 'suiteInfo' && changes.hasOwnProperty('suiteInfo')) {
        if (this.suiteInfo !== undefined) {
          this.init();
        }
      }
    }
  }
}
