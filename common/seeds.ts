import { RefStrings } from "../constants";

export const seedEmailProviders = [
  { name: RefStrings.provider.AWS_SES, priority: 1, isActive: true },
  { name: RefStrings.provider.SEND_BLUE, priority: 2, isActive: true },
];