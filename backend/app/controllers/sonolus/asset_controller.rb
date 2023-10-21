# frozen_string_literal: true
require "yaml"

module Sonolus
  class AssetController < SonolusController
    def list
      params.permit(:type)
      type = params[:type]
      names =
        Rails
          .root
          .glob("assets/#{type}/*.yml")
          .map { |path| File.basename(path).delete_suffix(".yml") }
      render json: {
               items:
                 names.map do |name|
                   Sonolus::AssetController.asset_get(
                     type.delete_suffix("s"),
                     name
                   )
                 end,
               pageCount: 1
             }
    end

    def show
      params.permit(:type, :name, :format)
      type = params[:type]
      name = params[:name]
      name += ".#{params[:format]}" if params[:format].present?
      item = Sonolus::AssetController.asset_get(type.delete_suffix("s"), name)
      if item.nil?
        render json: { error: "not_found", message: "Not Found" }, status: 404
      else
        render json: { item:, description: "", recommended: [] }
      end
    end

    def show_static
      params.permit(:type, :name)
      type = params[:type]
      name = params[:name]

      send_file Rails.root.join("assets", type, name)
    end

    def generate
      params.permit(:chart, :type)
      chart = Chart.find_by(name: params[:chart])
      if chart.nil?
        return(
          render json: { code: "not_found", message: "Not Found" }, status: 404
        )
      end
      type = params[:type].to_sym
      FileResource.uncached do
        if file = FileResource.find_by(chart_id: chart.id, kind: type)
          return redirect_to file.to_frontend, allow_other_host: true
        end
        generating =
          $redis.with do |conn|
            conn.get("sonolus:generate:#{chart.id}:#{type}")
          end
        should_generate =
          generating.nil? || generating.to_i < Time.now.to_i - 60
        if should_generate
          $redis.with do |conn|
            conn.set("sonolus:generate:#{chart.id}:#{type}", Time.now.to_i)
          end
          Rails.logger.info("Generating #{type} for #{chart.name}...")
          begin
            case type
            when :background_v1
              ImageConvertJob.perform_now(
                chart.name,
                chart.resources[:cover],
                :background_v1
              )
            when :background_v3
              ImageConvertJob.perform_now(
                chart.name,
                chart.resources[:cover],
                :background_v3
              )
            when :data
              ChartConvertJob.perform_now(chart.resources[:chart])
            else
              return(
                render json: {
                         code: "not_found",
                         message: "Not Found"
                       },
                       status: 404
              )
            end
          ensure
            $redis.with do |conn|
              conn.del("sonolus:generate:#{chart.id}:#{type}")
            end
          end

          if resource = FileResource.find_by(chart_id: chart.id, kind: type)
            Rails.logger.info("Generated #{type} for #{chart.name}")

            return redirect_to resource.to_frontend, allow_other_host: true
          else
            Rails.logger.info("Failed to generate #{type} for #{chart.name}")
            return(
              render json: {
                       code: "not_found",
                       message: "Not Found"
                     },
                     status: 404
            )
          end
        else
          Rails.logger.info("Already generating #{type} for #{chart.name}")
        end

        50.times do
          if FileResource.where(chart_id: chart.id, kind: type).exists? ||
               $redis.with { |conn|
                 conn.get("sonolus:generate:#{chart.id}:#{type}").nil?
               }
            break
          end

          Rails.logger.info("Waiting for generation of #{type}...")

          sleep 1
        end
        if FileResource.where(chart_id: chart.id, kind: type).exists?
          Rails.logger.info("Redirecting to #{type} for #{chart.name}")
          redirect_to FileResource.find_by(
                        chart_id: chart.id,
                        kind: type
                      ).to_frontend,
                      allow_other_host: true
        else
          Rails.logger.info("Failed to generate #{type} for #{chart.name}")
          render json: { code: "not_found", message: "Not Found" }, status: 404
        end
      end
    end

    def self.asset_get(type, name)
      begin
        data =
          YAML.load_file(
            Rails.root.join(
              "assets",
              "#{type}s",
              "#{name.sub("chcy-", "")}.yml"
            )
          )
      rescue Errno::ENOENT
        return nil
      end
      data.to_h do |k, v|
        next k, v unless v.is_a?(String)

        if k == "name"
          v = "chcy-#{v}"
        elsif v.start_with?("!asset:")
          v = asset_get(k, v.delete_prefix("!asset:"))
        elsif v.start_with?("!file:")
          name, srl_type = v.delete_prefix("!file:").split("/")
          srl_type ||= name
          v = {
            hash:
              Digest::SHA1.file(
                Rails.root.join("assets", "#{type}s", name)
              ).hexdigest,
            url: "/sonolus/assets/#{type}s/#{name}",
            type: srl_type
          }
        end
        [k, v]
      end
    end
  end
end
