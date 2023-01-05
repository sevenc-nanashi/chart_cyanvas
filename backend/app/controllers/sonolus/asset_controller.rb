# frozen_string_literal: true
require "yaml"

module Sonolus
  class AssetController < SonolusController
    def list
      params.permit(:type)
      type = params[:type]
      names =
        Rails.root.glob("assets/#{type}/*.yml")
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
      render json: {
               item:
                 Sonolus::AssetController.asset_get(
                   type.delete_suffix("s"),
                   name
                 ),
               description: "",
               recommended: []
             }
    end

    def show_static
      params.permit(:type, :name, :format)
      type = params[:type]
      name = params[:name]
      name += ".#{params[:format]}" if params[:format].present?

      send_file Rails.root.join("assets", type, name)
    end

    def self.asset_get(type, name)
      begin
        data =
          YAML.load_file(Rails.root.join("assets", "#{type}s", "#{name}.yml"))
      rescue Errno::ENOENT
        return nil
      end
      data.to_h do |k, v|
        next k, v unless v.is_a?(String)

        if v.start_with?("!asset:")
          v = asset_get(k, v.delete_prefix("!asset:"))
        elsif v.start_with?("!file:")
          v = {
            hash:
              Digest::SHA1.file(
                Rails.root.join("assets", "#{type}s", v.delete_prefix("!file:"))
              ).hexdigest,
            url: "/sonolus/assets/#{type}s/#{v.delete_prefix("!file:")}",
            type: v.delete_prefix("!file:")
          }
        end
        [k, v]
      end
    end
  end
end
