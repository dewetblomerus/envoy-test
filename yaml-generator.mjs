import { writeFileSync } from "node:fs";

const fragments = Array(50_000 * 12)
  .fill(1)
  .map(
    (_, index) =>
      `                  - match: { prefix: "/${index}/" }
                    route: { cluster: backend_cluster }`
  )
  .join("\n");
const yamlTemplate = `resources:
- "@type": type.googleapis.com/envoy.config.listener.v3.Listener
  name: listener_0
  address:
    socket_address:
      address: 0.0.0.0
      port_value: 10000
  filter_chains:
    - filters:
      - name: envoy.filters.network.http_connection_managers
        typed_config:
          "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
          stat_prefix: ingress_http
          route_config:
            name: all
            virtual_hosts:
              - name: backend_cluster
                domains: ["*"]
                routes:
${fragments}
                  - match:
                      prefix: "/"
                    route:
                      cluster: backend_cluster
          http_filters:
          - name: envoy.filters.http.router
            typed_config:
              "@type": type.googleapis.com/envoy.extensions.filters.http.router.v3.Router
`;
// console.log(fragments);
// console.log(yamlTemplate);
writeFileSync("generated-envoy.yaml", yamlTemplate, "utf-8");
