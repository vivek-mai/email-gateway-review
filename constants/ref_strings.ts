export class RefStrings {
  public static user: string = "User";

  // Emails
  public static emails: any = {
    subject: {
      welcome: "Welcome to P2e!",
    },
    file: {
      signupWelcome: "signupWelcome",
    },
    p2eWebsiteSubject: "Message from P2E Website",
    myIprSubject: 'Enquiry about MyIPR',
    emailType: {
      enquiry: 'enquiry',
      contact: 'contact'
    },
    emailsAddress: {
      myipr: "noreply@myipr.io",
      marketing: "hello@myipr.io",
      maiTo: "career@mai.io",
      maiFrom: "noreply@mai.io"
    }
  };


  public static status: any = {
    pending: "pending",
    failed: "failed",
    success: "success",
    debounced: 'debounced',
    error: "error",
    delivered: 'delivered'
  };

  public static provider: any = {
    SEND_BLUE: "SEND_BLUE",
    MAILGUN: 'MAILGUN',
    AWS_SES: 'AWS_SES'
  };

  public static meta: any = {
    requestType: {
      post: "POST",
      put: "PUT",
      get: "GET",
    },
  };

  public static Aws_Notifcation_Type: any = {
    DELIVERY: "Delivery",
    COMPLAINT: "Complaint",
    BOUNCE: 'Bounce'
  };

  public static errorCode: any = {
    badRequest: 400,
    requestTimeOut: 408,
    interNalError: 500,
  };



  public static serviceAuthKey: any = {
    NFTM: process.env.NFTM,
    AdminConsole: process.env.AdminConsole,
    AUTH_ENGINE: process.env.AUTH_ENGINE,
    PAYMENT_ENGINE: process.env.PAYMENT_ENGINE,
    P2EWebsite: process.env.P2EWebsite,
    KalptantraWebsite: process.env.KalptantraWebsite,
    MYIPR: process.env.MYIPR,
    MAI: "MAI"
  };

  public static sortQuery: any = {
    asc: 1,
    desc: -1,
    ASC: 'asc',
    DESC: 'desc'
  }

  public static fileFormats = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png',
    'text/plain', 'text/csv', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/zip'
  ]

  public static fileSize = 6291456;
  public static multerErrors = {
    fileSize: "LIMIT_FILE_SIZE",
    fileField: "LIMIT_UNEXPECTED_FILE",
    noOfFilesAllowed: "NO_OF_FILES_ALLOWED"
  }
  public static bouncifyStatus: any = {
    deliverable: 'deliverable',
    undeliverable: 'undeliverable',
    accept_all: 1
  }

  public static responseStatus = {
    success: 'success',
    failure: 'failure'
  }

  public static filePaths = {
    uploadFiles: 'public/files'
  }

  public static endpoints = {

    boucifyIo: {
      verification: '/v1/verify',
      checkCredentials : '/v1/info'
    },
    smsGateway: {
      apiVerification: '/platform/verify-api-key',
      profile: '/v1/users/profile'
    }
  }

  public static environments = {
    DEV: "DEV",
    STG: "STG",
    QA: "QA",
    PROD: "PROD",
    LOCAL:"LOCAL"
  }

  public static domainsFrom = {
    PREPROD: "p2eppl.com"
  }

}
