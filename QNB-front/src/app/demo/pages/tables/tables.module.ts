import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { CalendarComponent } from "@schedule-x/angular";
import { createCalendar, createViewWeek } from "@schedule-x/calendar";
import { TablesRoutingModule } from './tables-routing.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, TablesRoutingModule,CalendarComponent,RouterOutlet]
})
export class TablesModule {}
