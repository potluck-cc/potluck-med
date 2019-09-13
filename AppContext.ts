import { createContext, Dispatch } from "react";
import { User, Doctor } from "@potluckmarket/louis";

export interface AppContextInterface {
  isUserADoctor: boolean;
  currentAuthenticatedUser: User | Doctor | null;
  setCurrentAuthenticatedUser: Dispatch<any>;
  selectedConversation: null;
  selectConversation: Dispatch<any>;
  countyFilter: null;
  setCountyFilter: Dispatch<any>;
  appointmentNotifications: number;
  messageNotifications: number;
  setMessageNotifications: Dispatch<any>;
  setAppointmentNotifications: Dispatch<any>;
  initializeApp: (currentUser) => Promise<void>;
}

export default createContext<AppContextInterface | null>(null);
