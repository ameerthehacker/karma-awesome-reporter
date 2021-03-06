import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from './services/socket.service';
import { Subscription } from 'rxjs';
import { browserImages } from './constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  public initSubscription: Subscription;
  public specResultSubscription: Subscription;
  public browserErrorSubscription: Subscription;
  public summarySubscription: Subscription;
  public settingsSubscription: Subscription;
  public env: any;
  public browsers;
  public logs = {};
  public noTests = false;
  public settings: any;

  constructor(private socketService: SocketService) {}

  ngOnInit() {
    this.socketService.init();
    this.initSubscription = this.socketService
      .onMessage('init')
      .subscribe((env) => {
        this.updateUI(env);
      });

    this.specResultSubscription = this.socketService
      .onMessage('specResult')
      .subscribe((env) => {
        this.updateUI(env);
      });

    this.browserErrorSubscription = this.socketService
      .onMessage('browserError')
      .subscribe((info) => {
        if (this.env[info.id]) {
          this.env[info.id].error = info.error;
        }
      });

    this.summarySubscription = this.socketService
      .onMessage('summary')
      .subscribe((summary) => {
        this.env[summary.id].summary = summary.summary;
      });

    this.settingsSubscription = this.socketService
      .onMessage('settings')
      .subscribe((settings) => {
        this.settings = settings;
      });
  }

  public updateUI(env) {
    this.env = env;

    if (!this.browsers) {
      this.browsers = this.getBrowsers(env);
      this.browsers = this.processBrowsers(this.browsers);
    } else {
      let browsers = this.getBrowsers(env);
      browsers = this.processBrowsers(browsers);
      browsers.forEach((browser) => {
        const isPresent: boolean = this.browsers.find(
          (e) => e.id === browser.id
        );

        if (!isPresent) {
          this.browsers.push(browser);
        }
      });
    }
  }

  public getBrowsers(env) {
    const browsers = [];

    for (const key in env) {
      if (env.hasOwnProperty(key)) {
        browsers.push(env[key].browser);
      }
    }

    return browsers;
  }

  public processBrowsers(browsers) {
    for (let i = 0; i < browsers.length; i++) {
      const browserName = browsers[i].name;
      const browserId = browsers[i].id;

      this.logs[browserId] = [];
      for (const key in this.env[browserId].logs) {
        if (this.env[browserId].logs.hasOwnProperty(key)) {
          const logs = this.env[browserId].logs[key];

          if (logs.log.length > 0) {
            this.logs[browserId].push(logs);
          }
        }
      }

      browserImages.forEach((browserImage) => {
        if (browserName.startsWith(browserImage.name)) {
          browsers[i].name = browserImage.name;
          browsers[i].image = browserImage.image;
        }
      });
    }

    return browsers;
  }

  ngOnDestroy() {
    // Required to avoid memory leaks
    this.initSubscription.unsubscribe();
    this.specResultSubscription.unsubscribe();
    this.browserErrorSubscription.unsubscribe();
    this.summarySubscription.unsubscribe();
    this.settingsSubscription.unsubscribe();
  }
}
