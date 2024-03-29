# frozen_string_literal: true
module Sonolus
  class InfoController < SonolusController
    def info
      title = I18n.t("sonolus.title")
      title += " (dev)" if ENV["RAILS_ENV"] != "production"
      description = I18n.t("sonolus.info.description")
      if current_user
        pp current_user
        description +=
          "\n\n" +
            I18n.t(
              "sonolus.info.logged_in",
              name: current_user.name,
              handle: current_user.handle
            )
      end

      render json: {
               title:,
               banner: banner("banner"),
               hasMultiplayer: false,
               hasAuthentication: true,
               description:
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
