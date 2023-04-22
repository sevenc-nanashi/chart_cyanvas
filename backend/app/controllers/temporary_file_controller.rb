# frozen_string_literal: true

class TemporaryFileController < ApplicationController
  def read
    params.require(:id)

    file = TemporaryFile.find(params[:id])

    if file && file.path
      send_file file.path, disposition: "inline"
    else
      head :not_found
    end
  end
end
