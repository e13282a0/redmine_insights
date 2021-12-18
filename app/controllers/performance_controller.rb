class PerformanceController < ApplicationController

  def index
    #@project = Project.find(params[:project_id])

  end

  def project
    projectID = params['project_id']
    @project = Project.find(projectID)
    # read all project related time entries
    timeEntries = TimeEntry.where( :project_id => @project.id)

    #get involved users
    userIDs = timeEntries.pluck(:user_id).to_a()
    @users = User.where(:id => userIDs).to_a()

    #read all top level issues
    topLevelIssues = Issue.where( :project_id => @project.id, :parent_id => nil)
    logger.info "top level issues: "+topLevelIssues.count().to_s()

    # combine top level issues and related time entries
    @issues=[]
    topLevelIssues.each do |issue|   
      relatedIDs = issue.self_and_descendants.pluck(:id).to_a() # get own and all related issue IDs
      relatedTimeEntries = timeEntries.where(:issue_id => relatedIDs).to_a()
      
      logger.info "related time entries for issue "+issue.id.to_s()+" found:"+relatedTimeEntries.count().to_s()
      if (relatedTimeEntries.count() > 0)
        logger.info relatedTimeEntries
      end
      @issues.push({'id'=>issue.id, 'subject'=> issue.subject, 'issue' => issue, 'timeEntries'=>relatedTimeEntries})
      #puts relatedTimeEntries.count()
    end

    @time_entries = timeEntries.to_a()

    

  end

end
