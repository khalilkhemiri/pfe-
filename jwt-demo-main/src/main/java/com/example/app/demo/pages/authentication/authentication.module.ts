import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';  // Importer ReactiveFormsModule
import { HttpClientModule } from '@angular/common/http'; 
import { AuthenticationRoutingModule } from './authentication-routing.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, AuthenticationRoutingModule,
    BrowserModule,
    ReactiveFormsModule,  
    HttpClientModule 
  ]
})
export class AuthenticationModule {}
