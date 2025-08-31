import { initTRPC } from "@trpc/server";
import type { Context } from "@/router";

const t = initTRPC.context<Context>().create();

import add from "./procedures/add";
import list from "./procedures/list";
import remove from "./procedures/remove";
import retag from "./procedures/retag";
import search from "./procedures/search";

export const dirsRouter = t.router({
  add,
  list,
  search,
  retag,
  remove,
});
