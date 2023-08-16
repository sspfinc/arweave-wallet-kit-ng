import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ConnectButtonComponent } from "./connect-button.component";

@NgModule({
  declarations: [ConnectButtonComponent],
  imports: [CommonModule, FormsModule],
  exports: [ConnectButtonComponent],
})
export class AKNConnectButtonModule {}
