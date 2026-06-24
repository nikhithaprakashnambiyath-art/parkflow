import { Controller, Get, Post, Body, Param, Req, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { JwtGuard } from '../auth/jwt.guard';
import { SubmitReviewDto, SubmitServiceReviewDto } from './dto/review.dto';

@ApiTags('Reviews')
@Controller('api/reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('submit')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a review for a specific parking lot' })
  async submitReview(@Req() req: any, @Body() body: SubmitReviewDto) {
    return this.reviewService.submitReview(req.user.id, body);
  }

  @Get('lot/:lotId')
  @ApiOperation({ summary: 'Get all reviews for a specific parking lot' })
  async getReviewsForLot(@Param('lotId') lotId: string) {
    return this.reviewService.getReviewsForLot(lotId);
  }

  @Get('my')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all reviews submitted by the current authenticated user' })
  async getMyReviews(@Req() req: any) {
    return this.reviewService.getMyReviews(req.user.id);
  }

  @Get('has-reviewed')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if the current user has reviewed a booking' })
  async hasReviewed(@Req() req: any, @Query('bookingId') bookingId: string) {
    return { reviewed: await this.reviewService.hasReviewed(req.user.id, bookingId) };
  }

  @Post('service')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a general testimonial/service review' })
  async submitServiceReview(@Req() req: any, @Body() body: SubmitServiceReviewDto) {
    return this.reviewService.submitServiceReview(req.user.id, body.rating, body.comment);
  }

  @Get('service')
  @ApiOperation({ summary: 'Get all general testimonials/service reviews' })
  async getServiceReviews() {
    return this.reviewService.getServiceReviews();
  }
}
