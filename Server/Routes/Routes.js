import authRoutes from "./AuthRoutes.js";
import TodoRoutes from "./ToDoRoutes.js";
import EventRoutes from "./EventRoutes.js";
import StudySessionRoutes from "./StudySessionRoutes.js";
import FriendsRoutes from "./FriendsRoutes.js";
import UserRoutes from "./UserRoutes.js";

export function mountRoutes(app) {
  app.use("/auth", authRoutes);
  app.use("/todo", TodoRoutes);
  app.use("/events", EventRoutes);
  app.use("/study-sessions", StudySessionRoutes);
  app.use("/friends", FriendsRoutes);
  app.use("/user", UserRoutes);
}
