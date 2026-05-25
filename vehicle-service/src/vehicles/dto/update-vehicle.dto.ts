export class UpdateVehicleDto {
  make?: string | null;
  model?: string | null;
  year?: number | null;
  user_id!: string;
}
