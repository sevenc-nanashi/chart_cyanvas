# frozen_string_literal: true
module Sonolus
  class InfoController < SonolusController
    def info
      title = I18n.t("sonolus.title")
      title += " (dev)" if ENV["RAILS_ENV"] != "production"
      description = I18n.t("sonolus.info.description")
      if current_user
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

      render json: {
               title:,
               banner: banner("banner"),
               description: I18n.t("test.info.description")
             }
    end

    def empty_info
      render json: { searches: [], sections: [] }
    end
  end
end
