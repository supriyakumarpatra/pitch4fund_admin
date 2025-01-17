import { Component, OnInit } from '@angular/core';
import { NotifierService } from 'angular-notifier';
import { RestserviceService } from 'src/app/restservice.service';
import * as moment from 'moment';

@Component({
  selector: 'app-pitch-meeting',
  templateUrl: './pitch-meeting.component.html',
  styleUrls: ['./pitch-meeting.component.css']
})
export class PitchMeetingComponent implements OnInit {
  proposedTimeList: any;
  offset = 0;
  limit = 20;
  count: number = 0;
  investorSearch = '';
  startupSearch = '';
  constructor(private rest: RestserviceService, private notifier: NotifierService) { }

  ngOnInit(): void {
    this.getAllProposedTime();
    let myMoment: moment.Moment = moment("someDate");
    
    
    var now = moment();
    now.zone("America/Chicago"); 
    var localOffset = now.utcOffset();
    
    now.isUtcOffset()
    now.zone("America/Chicago"); // your time zone, not necessarily the server's
    var centralOffset = now.utcOffset();
    var diffInMinutes = localOffset - centralOffset;
    console.log(localOffset);
  }

  getAllProposedTime():void{

    const params = {userId:1,offset:this.offset,limit:this.limit,investorSearch:this.investorSearch,startupSearch:this.startupSearch}
    this.rest.getAllProposedTime(params).subscribe(
      (res: any)=>{
        console.log(res);
        if(res.success){
          this.proposedTimeList = res.response;
          this.countAllData()
          console.log(this.proposedTimeList);
        }else{
          this.notifier.notify('error',res.message);
        }
      }
    );
  }

  onChangeStatus(status:string,id:number) : void{
    const params = {
      id:id,
      status:status
    };
    this.rest.handleProposedTimeByAdmin(params).subscribe(
      (res: any)=>{
        if(res.success){
          this.getAllProposedTime();
          this.notifier.notify('success',res.message);
        }else{
          this.notifier.notify('error',res.message);
        }
      }
    );
  }

  onPrevious(){
    if(!this.offset){
      return;
    }
    this.offset -= this.limit;
    this.getAllProposedTime();
  }

  onNext(){
    if((this.offset+this.limit)>this.count || (this.offset+this.limit) == this.count){
      return;
    }
    this.offset += this.limit;
    this.getAllProposedTime();
  }

  countAllData(): void{
    const cardParam = {userId: 1,investorSearch:this.investorSearch,startupSearch:this.startupSearch};
    this.rest.countAllProposedTime(cardParam).subscribe(
        (res:any)=>{
            if(res.success){
                this.count = res.response?.totalData;
                console.log(this.count)
            }
        }
    );
  }

   getTimeZoneOffset(date, timeZone) {

    // Abuse the Intl API to get a local ISO 8601 string for a given time zone.
    let iso = date.toLocaleString('en-CA', { timeZone, hour12: false }).replace(', ', 'T');
  
    // Include the milliseconds from the original timestamp
    iso += '.' + date.getMilliseconds().toString().padStart(3, '0');
  
    // Lie to the Date object constructor that it's a UTC time.
    const lie:any = new Date(iso + 'Z');
    // console.log('lie',lie);
    // Return the difference in timestamps, as minutes
    // Positive values are West of GMT, opposite of ISO 8601
    // this matches the output of `Date.getTimeZoneOffset`
    return -(lie - date) / 60 / 1000;
  }

  calculateTimeZoneOffset(timeZone: String){
    // a='UTC + 05:30'
    timeZone = timeZone.trim();  
  timeZone= timeZone.substr(timeZone.indexOf('C')+1);
  //O.P: ' + 05:30'
  timeZone=timeZone.trim();
  //O.P: '+ 05:30'
  const data = timeZone.split(' ');
  //O.P: ['+', '05:30']
  // console.log(data);
  const time = data[data.length-1].split(':');

  // if(data.length === 2){
  // }else{
  //   const time = data[0].split(':');
  // }
  if(data.length >1){
    if(data[0] == '+'){
      return -(((Number(time[0])*60)+Number(time[1])))
    }else{
      return (((Number(time[0])*60)+Number(time[1])))
    }
  }else{
    return (((Number(time[0])*60)+Number(time[1])))
  }
  
  // if(data[0]=='+'){
  //   return -(((Number(time[0])*60)+Number(time[1])))
  // }else{
  //   return (((Number(time[0])*60)+Number(time[1])))
  // }

  }

  showTimeDifferents(item: any){
    const investorTimeZone  = item.investorTimeZone;
    const startupTimeZone   = item.startupTimeZone;
    console.log(startupTimeZone,investorTimeZone);
    
    // const investorUTCTime   = this.calculateTimeZoneOffset(investorTimeZone);
    // const startupUTCTime    =  this.calculateTimeZoneOffset(startupTimeZone);
    // // console.log(startupUTCTime)
    // // return startupUTCTime;
    return (Number(investorTimeZone)-Number(startupTimeZone));
  }

  onSearch(){
    this.getAllProposedTime();
  }

}
