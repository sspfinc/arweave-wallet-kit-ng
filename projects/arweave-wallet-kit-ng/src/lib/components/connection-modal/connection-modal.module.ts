import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ConnectionModalComponent } from "./connection-modal.component";
import { FormsModule } from "@angular/forms";

@NgModule({
  declarations: [ConnectionModalComponent],
  imports: [CommonModule, FormsModule],
  exports: [ConnectionModalComponent],
})
export class AKNConnectionModalModule {}
