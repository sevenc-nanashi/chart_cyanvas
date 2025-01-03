# frozen_string_literal: true
module Sonolus
  class InfoController < SonolusController
    BACKGROUNDS = %i[v1 v3].freeze
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
               buttons: [
                 { type: "authentication" },
                 { type: "level" },
                 { type: "skin" },
                 { type: "background" },
                 { type: "effect" },
                 { type: "particle" },
                 { type: "engine" },
                 { type: "configuration" }
               ],
               configuration: {
                 options: [
                   {
                     query: :c_background,
                     name: I18n.t("sonolus.configuration.background.title"),
                     type: "select",
                     required: false,
                     def: :v3,
                     values:
                       BACKGROUNDS.map { |background|
                         {
                           name: background,
                           title:
                             I18n.t(
                               "sonolus.configuration.background.options.#{background}"
                             )
                         }
                       }
                   }
                 ]
               },
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
