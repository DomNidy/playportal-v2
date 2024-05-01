import { Database } from "types_db";

const transactions: Database["public"]["Tables"]["transactions"]["Row"][] = [
  {
    amount: 10,
    created_at: "now",
    id: "123123123",
    type: "CreateVideo",
    user_id: "me123",
  },
];


