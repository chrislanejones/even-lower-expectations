# Parking lot

Open items for the next session. Beach site work lives in its own repo and is not tracked here.

| Item | Why | How |
|---|---|---|
| Re-sync the Claude Design project | The project was uploaded before the local WebP photos, the AOL video window (`VideoAd`) and the per-sex "Top news" facts landed, so it's out of date | Run `/design-sync` (re-sync to project ba223313-cd23-42ac-a478-8a077b7516a7) |
| Approve pnpm global build scripts | `pnpm add -g vercel@latest` (10-13-2026) skipped install scripts for esbuild, sharp, keytar, node-pty, @parcel/watcher and others | `pnpm approve-builds -g`, then check `vercel --version` still prints 63.1.2 |
