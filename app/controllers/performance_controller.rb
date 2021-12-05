class PerformanceController < ApplicationController

  def index
    #@project = Project.find(params[:project_id])

  end

  def project
    Rails.logger.error "params inspection: #{params.inspect}"
    @project_id = params['project_id']
    #@project = Project.find(params[:project_id])
  end

end
