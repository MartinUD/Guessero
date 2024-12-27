import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { TestComponent } from './test/test.component';
import { LandingPageComponent } from "./landing-page/landing-page.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, TestComponent, LandingPageComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent {
  title = "Guessero";
}