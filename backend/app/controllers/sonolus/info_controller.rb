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
                       BACKGROUND_VERSIONS.map { |background|
                         {
                           name: background,
                           title:
                             I18n.t(
                               "sonolus.backgrounds.versions.#{background}"
                             )
                         }
                       }
                   },
                   {
                     query: :c_genres,
                     name: I18n.t("sonolus.configuration.genres.title"),
                     description:
                       I18n.t("sonolus.configuration.genres.description"),
                     type: "multi",
                     required: false,
                     def: Chart::GENRES.map { true },
                     values:
                       Chart::GENRES.keys.map { |genre|
                         {
                           name: genre,
                           title: I18n.t("sonolus.levels.genres.#{genre}")
                         }
                       }
                   }
                 ]
               },
               description:
             }
    end
  end
end
