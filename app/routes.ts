import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),    
    route("callback", "routes/auth/callback.tsx"),    
] satisfies RouteConfig;
