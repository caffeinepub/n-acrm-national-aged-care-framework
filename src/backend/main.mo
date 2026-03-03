import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  type IndicatorResult = {
    id : Text;
    providerId : Text;
    quarter : Text;
    dimension : Text;
    indicatorCode : Text;
    indicatorName : Text;
    rate : Float;
    quintileRank : Nat;
    nationalBenchmark : Float;
    trend : Text;
  };

  module IndicatorResult {
    public func compare(a : IndicatorResult, b : IndicatorResult) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  type ProviderScorecard = {
    id : Text;
    providerId : Text;
    quarter : Text;
    overallScore : Float;
    safetyScore : Float;
    preventiveScore : Float;
    experienceScore : Float;
    equityScore : Float;
    quintileRank : Nat;
  };

  module ProviderScorecard {
    public func compare(a : ProviderScorecard, b : ProviderScorecard) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  type HighRiskCohort = {
    id : Text;
    providerId : Text;
    riskCriteria : Text;
    cohortSize : Nat;
    flagDate : Int;
    status : Text;
    urgency : Text;
  };

  module HighRiskCohort {
    public func compare(a : HighRiskCohort, b : HighRiskCohort) : Order.Order {
      Text.compare(a.id, b.id);
    };

    public func compareByProviderId(a : HighRiskCohort, b : HighRiskCohort) : Order.Order {
      Text.compare(a.providerId, b.providerId);
    };
  };

  type ScreeningWorkflow = {
    id : Text;
    providerId : Text;
    screeningType : Text;
    dueDate : Int;
    status : Text;
    completionTimeHours : Float;
  };

  module ScreeningWorkflow {
    public func compare(a : ScreeningWorkflow, b : ScreeningWorkflow) : Order.Order {
      Text.compare(a.id, b.id);
    };

    public func compareByProviderId(a : ScreeningWorkflow, b : ScreeningWorkflow) : Order.Order {
      Text.compare(a.providerId, b.providerId);
    };
  };

  type PayForImprovement = {
    id : Text;
    providerId : Text;
    quarter : Text;
    metricType : Text;
    baselineValue : Float;
    currentValue : Float;
    improvementPct : Float;
    fundingEligible : Bool;
    fundingAmount : Float;
  };

  module PayForImprovement {
    public func compare(a : PayForImprovement, b : PayForImprovement) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  type DataIngestionRecord = {
    id : Text;
    providerId : Text;
    quarter : Text;
    submissionType : Text;
    recordCount : Nat;
    validationErrors : Nat;
    dataQualityScore : Float;
    processingStatus : Text;
  };

  module DataIngestionRecord {
    public func compare(a : DataIngestionRecord, b : DataIngestionRecord) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  type AuditLog = {
    id : Text;
    userId : Text;
    userRole : Text;
    action : Text;
    entityType : Text;
    timestamp : Int;
    details : Text;
  };

  module AuditLog {
    public func compare(a : AuditLog, b : AuditLog) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  type RegionalAggregate = {
    id : Text;
    state : Text;
    region : Text;
    quarter : Text;
    totalProviders : Nat;
    avgSafetyScore : Float;
    screeningComplianceRate : Float;
    highRiskPrevalence : Float;
  };

  type NationalOverviewStats = {
    totalProviders : Nat;
    totalResidents : Nat;
    avgSafetyScore : Float;
    avgPreventiveScore : Float;
    screeningComplianceRate : Float;
    highRiskFlagged : Nat;
    dataQualityScore : Float;
  };

  let auditLogs = Map.empty<Text, AuditLog>();
  let highRiskCohorts = Map.empty<Text, HighRiskCohort>();
  let screeningWorkflows = Map.empty<Text, ScreeningWorkflow>();

  public query ({ caller }) func getIndicatorResults(providerId : Text, quarter : Text) : async [IndicatorResult] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    let allResults : [IndicatorResult] = [
      {
        id = "ind_001";
        providerId = "prov_001";
        quarter = "Q1-2024";
        dimension = "Safety";
        indicatorCode = "PRT";
        indicatorName = "Pressure Ulcers";
        rate = 1.5;
        quintileRank = 1;
        nationalBenchmark = 3.2;
        trend = "Improved";
      },
      {
        id = "ind_002";
        providerId = "prov_001";
        quarter = "Q1-2024";
        dimension = "Safety";
        indicatorCode = "MRSA";
        indicatorName = "Infections";
        rate = 0.8;
        quintileRank = 2;
        nationalBenchmark = 1.5;
        trend = "Stable";
      },
      {
        id = "ind_003";
        providerId = "prov_002";
        quarter = "Q1-2024";
        dimension = "Safety";
        indicatorCode = "PRT";
        indicatorName = "Pressure Ulcers";
        rate = 2.2;
        quintileRank = 3;
        nationalBenchmark = 3.2;
        trend = "Improved";
      },
    ];
    allResults.filter(
      func(result) {
        result.providerId == providerId and result.quarter == quarter
      }
    );
  };

  public query ({ caller }) func getScorecardsByProvider(providerId : Text) : async [ProviderScorecard] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    let allScorecards : [ProviderScorecard] = [
      {
        id = "sc1";
        providerId = "prov_001";
        quarter = "Q1-2024";
        overallScore = 86.5;
        safetyScore = 88.2;
        preventiveScore = 85.4;
        experienceScore = 84.6;
        equityScore = 88.7;
        quintileRank = 1;
      },
      {
        id = "sc2";
        providerId = "prov_002";
        quarter = "Q1-2024";
        overallScore = 77.5;
        safetyScore = 79.4;
        preventiveScore = 76.3;
        experienceScore = 75.9;
        equityScore = 70.8;
        quintileRank = 2;
      },
    ];
    allScorecards.filter(func(sc) { sc.providerId == providerId });
  };

  public query ({ caller }) func getNationalOverviewStats(_quarter : Text) : async NationalOverviewStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    {
      totalProviders = 10;
      totalResidents = 2000;
      avgSafetyScore = 80.2;
      avgPreventiveScore = 78.5;
      screeningComplianceRate = 82.1;
      highRiskFlagged = 85;
      dataQualityScore = 90.4;
    };
  };

  public query ({ caller }) func getAllHighRiskCohorts() : async [HighRiskCohort] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    let cohortValues = highRiskCohorts.values().toArray();
    cohortValues.sort();
  };

  public query ({ caller }) func getAllScreeningWorkflows() : async [ScreeningWorkflow] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    let workflowValues = screeningWorkflows.values().toArray();
    workflowValues.sort();
  };

  public query ({ caller }) func getAuditLogs() : async [AuditLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let values = auditLogs.values().toArray();
    values.sort();
  };

  public shared ({ caller }) func addAuditLogEntry(userId : Text, userRole : Text, action : Text, entityType : Text, details : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    let newLog : AuditLog = {
      id = Time.now().toText();
      userId;
      userRole;
      action;
      entityType;
      timestamp = Time.now();
      details;
    };
    auditLogs.add(newLog.id, newLog);
  };

  public shared ({ caller }) func updateScreeningStatus(workflowId : Text, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    switch (screeningWorkflows.get(workflowId)) {
      case (null) { Runtime.trap("Workflow does not exist") };
      case (?workflow) {
        let updatedWorkflow : ScreeningWorkflow = {
          workflow with
          status
        };
        screeningWorkflows.add(workflowId, updatedWorkflow);
      };
    };
  };

  public query ({ caller }) func getHighRiskCohorts(providerId : Text) : async [HighRiskCohort] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    highRiskCohorts.values().filter(func(c) { c.providerId == providerId }).toArray().sort(HighRiskCohort.compareByProviderId);
  };

  public query ({ caller }) func getScreeningWorkflows(providerId : Text) : async [ScreeningWorkflow] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    screeningWorkflows.values().filter(func(w) { w.providerId == providerId }).toArray().sort(ScreeningWorkflow.compareByProviderId);
  };
};
