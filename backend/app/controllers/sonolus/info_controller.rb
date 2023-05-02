# frozen_string_literal: true
module Sonolus
  class InfoController < SonolusController
    def info
      title = I18n.t("sonolus.title")
      title += " (dev)" if ENV["RAILS_ENV"] != "production"

      render json:
               {
                 title:,
                 banner: banner("banner"),
                 levels: {
                   items:
                     Chart
                       .order(published_at: :desc)
                       .limit(5)
                       .includes(:author)
                       .eager_load(file_resources: { file_attachment: :blob })
                       .where(visibility: :public)
                       .sonolus_listed
                       .map(&:to_sonolus),
                   search: {
                     options: Sonolus::LevelsController.search_options
                   }
                 }
               }.tap { |json|
                 %i[backgrounds skins effects particles engines].each do |key|
                   json[key] = { items: [], search: { options: [] } }
                 end
               }
    end

    def test_info
      title = I18n.t("test.title")
      title += " (dev)" if ENV["RAILS_ENV"] != "production"

      render json:
               {
                 title:,
                 banner: banner("banner"),
                 levels: {
                   items: [
                     dummy_level("test.welcome", "test-welcome", cover: "logo")
                   ],
                   search: {
                     options: Sonolus::LevelsController.search_options
                   }
                 }
               }.tap { |json|
                 %i[backgrounds skins effects particles engines].each do |key|
                   json[key] = { items: [], search: { options: [] } }
                 end
               }
    end
  end
end
