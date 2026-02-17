import mongoose from "mongoose";

const { Schema } = mongoose;

const AttendanceSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dateKey: { type: String, required: true },
    scannedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

AttendanceSchema.index({ user: 1, dateKey: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", AttendanceSchema);
export default Attendance;
