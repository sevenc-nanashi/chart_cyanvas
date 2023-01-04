# frozen_string_literal: true
module Sonolus
  class InfoController < SonolusController
  def info
    render json:
             {
               title: I18n.t("sonolus.title"),
               levels: {
                 items: [],
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
