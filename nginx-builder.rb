base = File.read("./nginx.conf.base")

inject = +""
%w[api auth/sonolus test/sonolus sonolus rails admin/sidekiq test].each do |route|
  if route.is_a?(Array)
    from = route[0]
    to = route[1]
  else
    from = route
    to = route
  end
  inject << <<~NGINX
    location /#{from}/ {
      proxy_pass http://back/#{to}/;
    }
  NGINX
end

base.gsub!("# inject", inject.gsub("\n", "\n    "))

File.write("./nginx.conf", base)
