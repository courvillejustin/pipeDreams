module.exports = {
	'accountBillView': {
		'usageDollar': {
			"{{accountNumber}}": {
				'revenueYearMonth': {
					'{{revenueYearMonth}}': {
						'utilities': {
							'{{utilityCode}}': {
								'sockets': {
									'{{serviceId}}': {
										'meters': {
											'{{meter}}': {
												'startDate': '{{startDate}}',
												'endDate': '{{endDate}}',
												'rate': '{{rate}}',
												'utility': '{{utilityCode}}',
												'account': '{{accountNumber}}',
												'billPeriod': '{{revenueYearMonth}}',
												'lineItems': {
													'{{typeCode}}': {
														'codes': {
															'{{adjustmentCode}}': ['{{amount}}']
														}
													}
												}
											}
										}
										//
									}
								}
								//
							}
						}
					}
					//
				}
				//
			}
			//
		},
		'fixCharge': {
			"{{accountNumber}}": {
				'revenueYearMonth': {
					'{{revenueYearMonth}}': {
						'utilities': {
							'{{utilityCode}}': {
								'sockets': {
									'{{serviceId}}': {
										'testTotals': ['{{amount}}'],
										'meters': {
											'{{meter}}': {
												'startDate': '{{startDate}}',
												'endDate': '{{endDate}}',
												'rate': '{{rate}}',
												'lineItems': {
													'FixCharge': {
														'codes': {

															'OTHER': ['{{amount}}']
														}
													}
												}
											}
										}
										//
									}
								}
								//
							}
						}
					}
					//
				}
				//
			}
			//
		},
		'usageOnly': {
			"{{accountNumber}}": {
				'revenueYearMonth': {
					'{{revenueYearMonth}}': {
						'utilities': {
							'{{utilityCode}}': {
								'sockets': {
									'{{serviceId}}': {
										'meters': {
											'{{meter}}': {
												'startDate': '{{startDate}}',
												'endDate': '{{endDate}}',
												'rate': '{{rate}}',
												'usageOnly': {
													'usage': '{{usage}}',
													'additionalUsage': '{{additionalUsage}}',
													'demandUsage': '{{demandUsage}}',
												}
											}
										}
										//
									}
								}
								//
							}
						}
					}
					//
				}
				//
			}
			//
		}

	}
};
